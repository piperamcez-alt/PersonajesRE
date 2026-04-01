/* ═══════════════════════════════════════════════
   RESIDENT EVIL UNIVERSE — main.js
   Módulos:
     1. Loader inicial
     2. Lluvia de sangre
     3. Carrusel 3D + partículas canvas
     4. Contadores animados
     5. Datos (juegos, personajes, resúmenes, villanos)
     6. Generación de cards
     7. Buscador
     8. Cronología
     9. Villanos
    10. Modal con loader
    11. Luz de cursor
    12. Scroll suave de nav
═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════
   1. LOADER INICIAL
══════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('umbrella-loader');
  window.addEventListener('load', () => {
    loader.classList.add('hide');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  });
})();

/* ══════════════════════════════════════════════
   2. LLUVIA DE SANGRE
══════════════════════════════════════════════ */
(function initBloodRain() {
  function createDrops() {
    const rain = document.getElementById('blood-rain');
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 30; i++) {
      const drop = document.createElement('div');
      drop.classList.add('drop');
      drop.style.cssText =
        `left:${Math.random() * 100}%;` +
        `height:${20 + Math.random() * 50}px;` +
        `animation-duration:${2.5 + Math.random() * 4}s;` +
        `animation-delay:${Math.random() * 6}s`;
      frag.appendChild(drop);
    }
    rain.appendChild(frag);
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(createDrops, { timeout: 1000 });
  } else {
    setTimeout(createDrops, 300);
  }
})();

/* ══════════════════════════════════════════════
   3. CARRUSEL 3D + PARTÍCULAS CANVAS
══════════════════════════════════════════════ */
(function initCarousel() {
  const slides   = Array.from(document.querySelectorAll('.slide-3d'));
  const dotsWrap = document.getElementById('dots3d');
  const canvas   = document.getElementById('carousel-canvas');
  const ctx      = canvas.getContext('2d');
  canvas.width = 580; canvas.height = 340;

  let current = 0;
  const total = slides.length;

  function getPositionClass(i) {
    const diff = (i - current + total) % total;
    if (diff === 0)                    return 'active';
    if (diff === 1)                    return 'right';
    if (diff === total - 1)            return 'left';
    if (diff <= Math.floor(total / 2)) return 'hidden-right';
    return 'hidden-left';
  }

  function render() {
    slides.forEach((s, i) => { s.className = 'slide-3d ' + getPositionClass(i); });
    document.querySelectorAll('.dots-3d span').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { current = i; render(); });
    dotsWrap.appendChild(dot);
  });

  document.querySelector('.prev-3d').addEventListener('click', () => {
    current = (current - 1 + total) % total; render();
  });
  document.querySelector('.next-3d').addEventListener('click', () => {
    current = (current + 1) % total; render();
  });

  slides.forEach((s, i) => {
    s.addEventListener('click', () => {
      if (!s.classList.contains('active')) { current = i; render(); }
    });
  });

  setInterval(() => { current = (current + 1) % total; render(); }, 5000);
  render();

  /* Partículas — se pausan fuera de la vista */
  const PARTICLE_COUNT = 40;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x:     Math.random() * 580,
    y:     Math.random() * 340,
    r:     Math.random() * 1.8 + 0.4,
    vx:   (Math.random() - 0.5) * 0.4,
    vy:   (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.7 + 0.15,
    color: Math.random() < 0.6 ? 'rgba(220,0,0,' : 'rgba(255,255,255,',
  }));

  let rafId = null;
  let visible = false;

  function drawParticles() {
    ctx.clearRect(0, 0, 580, 340);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0)   p.x = 580;
      if (p.x > 580) p.x = 0;
      if (p.y < 0)   p.y = 340;
      if (p.y > 340) p.y = 0;
      p.alpha += (Math.random() - 0.5) * 0.03;
      p.alpha  = Math.max(0.05, Math.min(0.85, p.alpha));
    });
    if (visible) rafId = requestAnimationFrame(drawParticles);
  }

  // Pausar partículas cuando el carrusel no está visible
  const carouselObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      visible = e.isIntersecting;
      if (visible && !rafId) {
        rafId = requestAnimationFrame(drawParticles);
      } else if (!visible && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0.1 });

  carouselObserver.observe(document.querySelector('.carousel-3d-wrap'));
})();


/* ══════════════════════════════════════════════
   4. CONTADORES ANIMADOS
══════════════════════════════════════════════ */
(function initCounters() {
  function animateCount(el, target, duration = 1800) {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-number').forEach(n => {
          animateCount(n, +n.dataset.target);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) observer.observe(statsSection);
})();

/* ══════════════════════════════════════════════
   5. DATOS
══════════════════════════════════════════════ */
const DATA = {
  juegos: [
    'Resident Evil 0', 'Resident Evil 1', 'Resident Evil 2',
    'Resident Evil 3', 'Code Veronica',   'Resident Evil 4',
    'Resident Evil 5', 'Resident Evil 6', 'Resident Evil 7',
    'Resident Evil Village', 'Resident Evil Requiem',
  ],

  descripcion: [
    'Origen del virus T y Umbrella.',
    'Incidente en la mansión Spencer.',
    'Caos en Raccoon City con Leon y Claire.',
    'Jill huye de Nemesis.',
    'Expansión de Umbrella en Europa.',
    'Cambio total al horror de acción.',
    'Cooperativo contra bioterrorismo.',
    'Historia global con múltiples campañas.',
    'Regreso al terror en primera persona.',
    'Ethan enfrenta horrores en una aldea.',
    'Nueva amenaza que pone a prueba a los sobrevivientes.',
  ],

  años: ['2002','1996','1998','1999','2000','2005','2009','2012','2017','2021','2025'],

  portadas: [
    'https://upload.wikimedia.org/wikipedia/en/c/c6/Rezerobox.jpg',
    'https://preview.redd.it/resident-evil-1-original-vs-remaster-v0-g38zjcaso2lf1.jpg?width=640&crop=smart&auto=webp&s=b595b64dee1bc5b4284acb63887c33362fcac28e',
    'https://image.api.playstation.com/vulcan/ap/rnd/202206/0204/uDFoGvnMTTCLVmTwjj0njGWC.png',
    'https://jdigitales.cl/cdn/shop/files/WmriZBRlSeXWEEDLJOWW7MdW.jpg',
    'https://image.api.playstation.com/cdn/UP0102/CUSA07104_00/1SByc6guxYutHXu41xOlIjzh1suAqSMr.png',
    'https://next-media.elkjop.com/image/dv_web_D18000127471221/672443/resident-evil-4-pc-windows.jpg',
    'https://image.api.playstation.com/cdn/UP0102/CUSA04437_00/xAtMOkY23P4b0hj4gy8ZMiBgIcknZjKM.png',
    'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/221040/header.jpg?t=1768960676',
    'https://image.api.playstation.com/cdn/UP0102/CUSA04772_00/cxd9vkFOAHVwwYG7lQKENGkrfyoAChNh.png',
    'https://image.api.playstation.com/vulcan/ap/rnd/202101/0812/FkzwjnJknkrFlozkTdeQBMub.png',
    'https://www.kingspec.com/uploads/image/69ae25ca5cb1b.png',
  ],

  personajes: {
    'Resident Evil 0': [
      { nombre: 'Rebecca Chambers', rol: 'Médica del equipo Bravo de S.T.A.R.S.', img: 'https://arc-anglerfish-arc2-prod-copesa.s3.amazonaws.com/public/ETPG3ZZLWBCMTKPK6SK723HYS4.png' },
      { nombre: 'Billy Coen',        rol: 'Ex marine acusado de crímenes de guerra.',  img: 'https://static.wikia.nocookie.net/nemesis/images/e/e1/Billy.jpg/revision/latest?cb=20101105212213&path-prefix=es' },
    ],
    'Resident Evil 1': [
      { nombre: 'Jill Valentine', rol: 'Especialista en demolición del equipo Alpha.',      img: 'https://i.pinimg.com/736x/82/0d/3a/820d3a2a65e8ad28fa4391d3437c99ab.jpg' },
      { nombre: 'Chris Redfield', rol: 'Tirador experto del equipo Alpha de S.T.A.R.S.', img: 'https://www.evilresource.com/images/data/full/remake/chris-redfield.png' },
    ],
    'Resident Evil 2': [
      { nombre: 'Leon S. Kennedy', rol: 'Policía novel en su primer día en Raccoon City.', img: 'https://images.steamusercontent.com/ugc/1014939826513238984/8C7FF916F21EAA8BF253B2C25AA25B1D336562F1/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false' },
      { nombre: 'Claire Redfield', rol: 'Estudiante que busca a su hermano Chris.',         img: 'https://w0.peakpx.com/wallpaper/61/371/HD-wallpaper-resident-evil-resident-evil-2-2019-claire-redfield.jpg' },
    ],
    'Resident Evil 3': [
      { nombre: 'Jill Valentine',  rol: 'Sobreviviente de la mansión, perseguida por Nemesis.',     img: 'https://r1.community.samsung.com/t5/image/serverpage/image-id/3112982i012B56DBB8C6623B?v=v2' },
      { nombre: 'Carlos Oliveira', rol: 'Mercenario de la UBCS enviado a evacuar la ciudad.', img: 'Mercenario de la UBCS enviado a evacuar la ciudad.",img:"https://i.redd.it/cssbvtn693za1.jpg' },
    ],
    'Code Veronica': [
      { nombre: 'Claire Redfield', rol: 'Capturada por Umbrella mientras buscaba a Chris.', img: 'https://assetsio.gnwcdn.com/ps2-classic-resident-evil-code-veronica-x-out-today-on-ps4-1494420240332.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp' },
      { nombre: 'Chris Redfield',  rol: 'Veterano de S.T.A.R.S. que rescata a su hermana.',  img: 'https://static.wikia.nocookie.net/residentevil/images/6/66/Chris_Redfield_Portrait_CV.png/revision/latest/scale-to-width-down/200?cb=20200122135623&path-prefix=es' },
    ],
    'Resident Evil 4': [
      { nombre: 'Leon S. Kennedy', rol: 'Agente del gobierno en misión de rescate presidencial.', img: 'https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/24455591/RE4_Leon_01.jpg?w=1600&h=900&fit=crop' },
      { nombre: 'Ada Wong',        rol: 'Espía misteriosa con su propia agenda secreta.',         img: 'https://i.ytimg.com/vi/pL3mv_BkHh4/maxresdefault.jpg' },
    ],
    'Resident Evil 5': [
      { nombre: 'Chris Redfield', rol: 'Agente de la BSAA desplegado en África.',           img: 'https://www.evilresource.com/images/data/full/re5/chris-redfield.png' },
      { nombre: 'Sheva Alomar',   rol: 'Agente local de la BSAA, compañera de Chris.', img: 'https://www.evilresource.com/images/data/full/re5/sheva-alomar.png' },
    ],
    'Resident Evil 6': [
      { nombre: 'Leon S. Kennedy', rol: 'Agente obligado a enfrentar al presidente infectado.', img: 'https://i.pinimg.com/564x/aa/85/e4/aa85e4f51baeb9fed8d85610e0296800.jpg' },
      { nombre: 'Chris Redfield',  rol: 'Capitán de la BSAA lidiando con una crisis global.',   img: 'https://i.pinimg.com/736x/17/28/3b/17283bb1a3235b395ec45798f0642b68.jpg' },
    ],
    'Resident Evil 7': [
      { nombre: 'Ethan Winters', rol: 'Hombre corriente en busca de su esposa desaparecida.', img: 'https://static0.thegamerimages.com/wordpress/wp-content/uploads/2021/04/pjimage-94-1.jpg' },
      { nombre: 'Mia Winters',   rol: 'Esposa de Ethan con un pasado oscuro ligado a Umbrella.', img: 'https://preview.redd.it/mia-winters-is-an-evil-person-and-nobody-talks-about-it-v0-jx90ov0hicue1.jpg?width=540&format=pjpg&auto=webp&s=bad3c9ebe67930596c662cd38d1ba47fa28b3579' },
    ],
    'Resident Evil Village': [
      { nombre: 'Ethan Winters',   rol: 'Padre desesperado que busca a su hija secuestrada.',       img: 'https://static0.thegamerimages.com/wordpress/wp-content/uploads/2021/04/pjimage-94-1.jpg' },
      { nombre: 'Chris Redfield', rol: 'Capitán de la BSAA lidiando con una crisis global.', img: 'https://i.redd.it/dbd50surg8ye1.jpeg' },
    ],
    'Resident Evil Requiem': [
      { nombre: 'Leon S. Kennedy', rol: 'Veterano agente que enfrenta una nueva amenaza global.', img: 'https://sm.ign.com/ign_es/news/c/could-capc/could-capcom-really-kill-leon-in-resident-evil-requiem-new-i_5wd1.jpg' },
      { nombre: 'Claire Redfield', rol: 'Activista de derechos humanos y aliada clave.',            img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVmmCO2H8Rog7cpW2HrFUVHdFIYPRk2jojHQ&s' },
    ],
  },

  resumenes: {
    'Resident Evil 0':       'En 1998, la oficial Rebecca Chambers y el convicto Billy Coen quedan atrapados en un tren del Ecliptic Express infestado de criaturas mutantes. Juntos deben sobrevivir y descubrir los oscuros experimentos de Umbrella que dieron origen al virus T, enfrentándose al insidioso Dr. James Marcus.',
    'Resident Evil 1':       'El equipo S.T.A.R.S. Alpha es enviado a investigar extrañas desapariciones en las Montañas Arklay. Acorralados en una mansión aparentemente abandonada, Jill Valentine y Chris Redfield descubren laboratorios secretos de Umbrella donde se crearon armas biológicas capaces de convertir humanos en zombis.',
    'Resident Evil 2':       'Leon S. Kennedy, en su primer día como policía, y Claire Redfield, en busca de su hermano Chris, llegan a Raccoon City solo para encontrarla devastada por un brote zombi. Ambos deben escapar mientras descubren el papel de Umbrella en la catástrofe y protegen a Sherry Birkin.',
    'Resident Evil 3':       'Jill Valentine intenta huir de Raccoon City antes de que sea destruida, pero es perseguida implacablemente por Nemesis, un arma biológica de Umbrella diseñada para eliminar a los miembros de S.T.A.R.S. Con la ayuda del mercenario Carlos Oliveira, Jill lucha por sobrevivir las últimas horas de la ciudad condenada.',
    'Code Veronica':          'Capturada tras infiltrarse en instalaciones de Umbrella, Claire Redfield es enviada a una prisión en la isla Rockfort. Allí se enfrenta a Alexia Ashford y al virus T-Veronica, mientras su hermano Chris viaja hasta la Antártida para rescatarla.',
    'Resident Evil 4':       'Seis años después de Raccoon City, Leon S. Kennedy es enviado a una aldea rural de España para rescatar a Ashley Graham, hija del presidente de los Estados Unidos. Descubre que la comunidad está controlada por Los Iluminados, una secta que usa el parásito Las Plagas para dominar a las personas.',
    'Resident Evil 5':       'Chris Redfield, agente de la BSAA, viaja a Kijuju, África, junto a Sheva Alomar para investigar el tráfico de armas biológicas. El rastro lo lleva hasta su némesis Albert Wesker y a un virus evolucionado que amenaza con desencadenar una pandemia global.',
    'Resident Evil 6':       'Un ataque bioterrorista a escala mundial afecta simultáneamente a múltiples países. Leon, Chris, Jake Muller y Ada Wong protagonizan campañas paralelas que confluyen en una conspiración que involucra al virus C y a la organización Neo-Umbrella.',
    'Resident Evil 7':       'Ethan Winters rastrea a su esposa Mia hasta una plantación en Louisiana. Allí queda atrapado por la familia Baker, infectada por un bioorganismo llamado Eveline, capaz de controlar mentes y regenerar tejidos.',
    'Resident Evil Village': 'Ethan Winters vive en Europa con su familia cuando un ataque inesperado le arrebata a su hija Rose. Llega a una aldea maldita dominada por la imponente Lady Dimitrescu y otros lords que sirven a la misteriosa Madre Miranda.',
    'Resident Evil Requiem':  'Una nueva y devastadora amenaza bioterrorista sacude el mundo. Leon S. Kennedy y Claire Redfield se ven envueltos en una conspiración que pone a prueba todo lo que han sacrificado. Con enemigos más letales que nunca, ambos deberán dar todo para salvar a la humanidad.',
  },

  cronologia: [
    { año: '1996', titulo: 'Resident Evil 1',     desc: 'La mansión Spencer. Origen del terror.' },
    { año: '1998', titulo: 'Resident Evil 2',     desc: 'Raccoon City cae. Leon y Claire huyen.' },
    { año: '1998', titulo: 'Resident Evil 3',     desc: 'Jill Valentine es perseguida por Nemesis.' },
    { año: '1998', titulo: 'Resident Evil 0',     desc: 'Rebecca y Billy descubren el origen del virus T.' },
    { año: '2000', titulo: 'Code Veronica',        desc: 'La saga Ashford y el virus T-Veronica.' },
    { año: '2004', titulo: 'Resident Evil 4',     desc: 'Leon en Europa. Nace la era del horror de acción.' },
    { año: '2009', titulo: 'Resident Evil 5',     desc: 'Chris en África enfrenta a Wesker por última vez.' },
    { año: '2012', titulo: 'Resident Evil 6',     desc: 'Crisis global de bioterrorismo de escala masiva.' },
    { año: '2017', titulo: 'Resident Evil 7',     desc: 'Ethan Winters. El terror regresa en primera persona.' },
    { año: '2021', titulo: 'Resident Evil Village', desc: 'Ethan busca a su hija en una aldea maldita.' },
    { año: '2025', titulo: 'Resident Evil Requiem', desc: 'Una nueva amenaza sacude los cimientos de todo.' },
  ],

  villanos: [
    { nombre: 'Albert Wesker',  juego: 'RE1 / RE5',      badge: 'JEFE FINAL', img: 'https://preview.redd.it/ive-always-wanted-albert-wesker-maybe-this-is-finally-the-v0-csoyjz9na33b1.png?auto=webp&s=0d89c7a2bbaeaaca03da49b2d576fcb201abf32a' },
    { nombre: 'Nemesis',         juego: 'RE3',             badge: 'MUTANTE',    img: 'https://i.redd.it/why-did-umbrella-only-create-one-nemesis-when-they-created-v0-bq2nt1xv1m8g1.jpg?width=640&format=pjpg&auto=webp&s=a0053a3c2d0fa0aed3c070d1e890bbe7bbd059dd' },
    { nombre: 'Mr. X',           juego: 'RE2',             badge: 'TYRANT',     img: 'https://gameinformer.com/sites/default/files/styles/thumbnail/public/2019/01/28/7c6aeea4/tyranta.jpg.webp' },
    { nombre: 'Lady Dimitrescu', juego: 'RE Village',      badge: 'SEÑORA',     img: 'https://img.somosxbox.com/somosxbox/2021/02/22101808/lady-dimitrescu-2214829.jpg' },
    { nombre: 'Jack Baker',      juego: 'RE7',             badge: 'INFECTADO',  img: 'https://static.wikia.nocookie.net/residentevil/images/d/d5/Pizap.com14881662780421.jpg/revision/latest?cb=20170227033629&path-prefix=es' },
    { nombre: 'Alexia Ashford',  juego: 'Code Veronica',   badge: 'CIENTÍFICA', img: 'https://i.pinimg.com/736x/97/cd/bf/97cdbfb46a8efa8ddfcffcf31c214882.jpg' },
    { nombre: 'Salazar',         juego: 'RE4',             badge: 'SEÑOR',      img: 'https://i.redd.it/which-version-of-ramon-salazar-do-you-prefer-remake-or-v0-se5i7kjfw9qe1.jpg?width=736&format=pjpg&auto=webp&s=0b0e58cb9f9c663b89ce87ebcf42581863016fb4' },
    { nombre: 'Eveline',         juego: 'RE7',             badge: 'BIOARMA',    img: 'https://static.wikia.nocookie.net/residentevil/images/7/7d/Tumblr_opq1ryTLHm1uq9trmo6_1280.jpg/revision/latest?cb=20171210202439&path-prefix=es' },
  ],
};

/* ══════════════════════════════════════════════
   6. GENERACIÓN DE CARDS DE JUEGOS
══════════════════════════════════════════════ */
(function initGameCards() {
  const grid = document.getElementById('games-grid');
  DATA.juegos.forEach((nombre, i) => {
    const article = document.createElement('article');
    article.classList.add('game-card');
    article.dataset.name = nombre.toLowerCase();
    article.dataset.index = i;
    article.innerHTML = `
      <img src="${DATA.portadas[i]}" alt="Portada de ${nombre}" loading="lazy">
      <div class="game-card-content">
        <h3>${nombre}</h3>
        <p>${DATA.descripcion[i]}</p>
      </div>
    `;
    grid.appendChild(article);
  });
})();

/* ══════════════════════════════════════════════
   7. BUSCADOR
══════════════════════════════════════════════ */
(function initSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    document.querySelectorAll('.game-card').forEach(card => {
      card.classList.toggle('hidden', Boolean(query) && !card.dataset.name.includes(query));
    });
  });
})();

/* ══════════════════════════════════════════════
   8. CRONOLOGÍA
══════════════════════════════════════════════ */
(function initTimeline() {
  const timeline = document.getElementById('timeline');
  DATA.cronologia.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('tl-item');
    div.innerHTML = `
      <div class="tl-card">
        <h4>${item.titulo}</h4>
        <p>${item.desc}</p>
      </div>
      <div class="tl-dot"><span class="tl-year">${item.año}</span></div>
      <div aria-hidden="true" style="flex:0 0 calc(50% - 30px)"></div>
    `;
    timeline.appendChild(div);
  });
})();

/* ══════════════════════════════════════════════
   9. VILLANOS
══════════════════════════════════════════════ */
(function initVillains() {
  const grid = document.getElementById('villains-grid');
  DATA.villanos.forEach(v => {
    const article = document.createElement('article');
    article.classList.add('villain-card');
    article.innerHTML = `
      <img src="${v.img}" alt="${v.nombre}" loading="lazy"
           onerror="this.src='https://placehold.co/200x200/1a0000/ff2e2e?text=RE'">
      <span class="villain-badge">${v.badge}</span>
      <h4>${v.nombre}</h4>
      <span>${v.juego}</span>
    `;
    grid.appendChild(article);
  });
})();

/* ══════════════════════════════════════════════
   10. MODAL CON LOADER
══════════════════════════════════════════════ */
(function initModal() {
  const overlay    = document.getElementById('game-modal');
  const loader     = document.getElementById('modal-loader');
  const cover      = document.getElementById('modal-cover');
  const titleEl    = document.getElementById('modal-title');
  const yearEl     = document.getElementById('modal-year');
  const charsList  = document.getElementById('modal-characters');
  const summaryEl  = document.getElementById('modal-summary-text');
  const closeBtn   = document.querySelector('.modal-close');

  function openModal(nombre, index) {
    overlay.style.display = 'flex';
    loader.classList.remove('hide');
    cover.src = '';
    titleEl.textContent = '';
    yearEl.textContent  = '';
    charsList.innerHTML = '';
    summaryEl.textContent = '';

    setTimeout(() => {
      cover.src          = DATA.portadas[index];
      cover.alt          = `Portada de ${nombre}`;
      titleEl.textContent = nombre;
      yearEl.textContent  = `Año: ${DATA.años[index]}`;
      summaryEl.textContent = DATA.resumenes[nombre] || 'Resumen no disponible.';

      (DATA.personajes[nombre] || []).forEach(c => {
        const li = document.createElement('li');
        li.classList.add('character-item');
        li.innerHTML = `
          <img src="${c.img}" alt="${c.nombre}"
               onerror="this.src='https://placehold.co/64x64/1a0000/ff2e2e?text=RE'">
          <div>
            <h4>${c.nombre}</h4>
            <p>${c.rol}</p>
          </div>
        `;
        charsList.appendChild(li);
      });

      loader.classList.add('hide');
    }, 800);
  }

  /* Delegación de eventos en el grid */
  document.getElementById('games-grid').addEventListener('click', e => {
    const card = e.target.closest('.game-card');
    if (!card) return;
    const nombre = card.querySelector('h3').textContent;
    const index  = +card.dataset.index;
    openModal(nombre, index);
  });

  closeBtn.addEventListener('click', () => { overlay.style.display = 'none'; });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
})();

/* ══════════════════════════════════════════════
   11. LUZ DE CURSOR
══════════════════════════════════════════════ */
(function initCursorLight() {
  const light = document.createElement('div');
  light.classList.add('light');
  document.body.appendChild(light);

  let ticking = false;
  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!ticking) {
      requestAnimationFrame(() => {
        light.style.left = `${mx - 150}px`;
        light.style.top  = `${my - 150}px`;
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ══════════════════════════════════════════════
   12. SCROLL SUAVE DE NAV
══════════════════════════════════════════════ */
(function initNavScroll() {
  document.querySelector('.site-header h1').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href === '#' || href === '') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();