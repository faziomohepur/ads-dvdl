/* DVDL TMQ – tương tác trang */
(function () {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('navProgress');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  /* Nav chạy theo trang: đổi nền + thanh tiến trình */
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle && toggle.setAttribute('aria-expanded', String(open));
  };
  if (toggle) {
    toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMenu(!nav.classList.contains('is-open')); }
    });
  }
  links && links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* Link đang xem */
  const navAnchors = links ? [...links.querySelectorAll('a[href^="#"]')] : [];
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navAnchors.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* Hiệu ứng xuất hiện khi cuộn */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en, i) => {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = (i % 6) * 70 + 'ms';
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* Xe "lăn bánh" khi chạm trên màn hình cảm ứng */
  document.querySelectorAll('.car').forEach((car) => {
    const drive = () => {
      if (car.classList.contains('is-driving')) return;
      car.classList.add('is-driving');
      setTimeout(() => car.classList.remove('is-driving'), 1600);
    };
    car.addEventListener('touchstart', drive, { passive: true });
  });

  /* Nút trên từng thẻ -> điền sẵn loại xe/tour vào form */
  const select = document.getElementById('carSelect');
  const form = document.getElementById('bookingForm');
  document.querySelectorAll('[data-car]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-car');
      if (select) {
        const opt = [...select.options].find((o) => o.value === value || o.text === value);
        if (opt) { select.value = opt.value || opt.text; select.classList.add('is-picked'); }
      }
      if (form) {
        form.classList.remove('is-highlight');
        void form.offsetWidth;
        form.classList.add('is-highlight');
        setTimeout(() => {
          const first = form.querySelector('input[name="ho-ten"]');
          first && first.focus({ preventScroll: true });
        }, 700);
      }
    });
  });

  /* Gửi form đặt xe (Netlify Forms, AJAX) */
  if (form) {
    const status = document.getElementById('formStatus');
    const submit = form.querySelector('.form__submit');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      submit.disabled = true;
      status.className = 'form__status';
      status.textContent = 'Đang gửi yêu cầu…';
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.status);
          form.reset();
          select && select.classList.remove('is-picked');
          status.className = 'form__status ok';
          status.textContent = '✔ Đã nhận yêu cầu! Nhà xe sẽ gọi lại báo giá trọn gói trong ít phút.';
        })
        .catch(() => {
          status.className = 'form__status err';
          status.textContent = 'Gửi chưa thành công. Vui lòng gọi 0862 14 1234 hoặc nhắn Zalo để đặt xe.';
        })
        .finally(() => { submit.disabled = false; });
    });
  }

  /* Gợi ý nhãn cho 2 nút nổi lúc mới vào trang */
  const fab = document.querySelector('.fab');
  if (fab) {
    setTimeout(() => fab.classList.add('show-labels'), 1500);
    setTimeout(() => fab.classList.remove('show-labels'), 5000);
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
