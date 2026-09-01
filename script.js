/* =========================================================
     TUDO COMENTADO — feito pra você ler, entender e alterar.
     ========================================================= */

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;
  var enableFancyStuff = !prefersReducedMotion && isFinePointer;

  /* ---------- 1) Barra de progresso de scroll ---------- */
  var progressBar = document.getElementById('progressBar');
  function updateProgressBar(){
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ---------- 2) Header muda ao rolar a página ---------- */
  var header = document.getElementById('siteHeader');
  function updateHeaderState(){
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }

  window.addEventListener('scroll', function(){
    updateProgressBar();
    updateHeaderState();
  }, { passive: true });
  updateProgressBar();
  updateHeaderState();

  /* ---------- 2b) Menu mobile (hambúrguer) ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  navToggle.addEventListener('click', function(){
    var isOpen = mobileMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      mobileMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 3) Reveal ao entrar na viewport ---------- */
  var revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window){
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- 4) Cursor customizado ---------- */
  if (enableFancyStuff){
    document.body.classList.add('custom-cursor');
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var mouseX = 0, mouseY = 0;
    var ringX = 0, ringY = 0;

    window.addEventListener('mousemove', function(e){
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
    });

    // o anel "atrasa" um pouco em relação ao ponto — dá a sensação de peso
    function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('[data-cursor="link"], .project-card, .chip').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('is-hover'); });
    });
  }

  /* ---------- 5) Tilt 3D nos cards de projeto ---------- */
  if (enableFancyStuff){
    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        var rotateY = x * 8;
        var rotateX = y * -8;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ---------- 6b) Modal de detalhes dos projetos ---------- */
  (function(){
    var modal = document.getElementById('projectModal');
    if (!modal) return;
    var modalPanel = modal.querySelector('.project-modal-panel');
    var modalContent = document.getElementById('modalContent');
    var lastFocused = null;

    var iconCode = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
    var iconPlay = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>';

    // dados de cada projeto — texto usado pra montar o conteúdo do modal
    var projects = {
      saude: {
        addr: '0x04.1 · EM USO REAL',
        title: 'Acompanhamento em Saúde',
        tags: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
        body: [
          'Minha mãe é farmacêutica e participa de eventos de atendimento a idosos. Um deles, ligado à comunidade nipo-brasileira de Manaus, acontece todo ano e reúne dezenas de idosos pra aferição de sinais vitais e outros dados de saúde. Até pouco tempo, tudo isso era feito em papel — e depois vinham horas digitando ficha por ficha pra conseguir algum relatório.',
          'Criei esse sistema pra resolver isso: cadastro dos atendidos, histórico de atendimentos, módulo financeiro dos eventos. O problema é que o local onde o evento acontece não tem internet, e um sistema web comum simplesmente não funcionaria lá.',
          'A saída foi fazer o próprio site gerar um arquivo HTML autocontido — a "ficha de campo" — com uma cópia do banco de dados embutida dentro dele. Esse arquivo roda 100% offline, direto do navegador: dá pra preencher o atendimento de alguém que já tem cadastro ou cadastrar um idoso novo, tudo sem internet.',
          'Quando a internet volta, esse mesmo arquivo é importado de volta no sistema pelo botão "Importar ficha". Ele reconhece sozinho quem já estava cadastrado — e atualiza o histórico — e cria o cadastro de quem ainda não tinha, sem precisar digitar nada duas vezes.'
        ],
        mock: true,
        note: 'O sistema já está pronto e minha mãe usa de verdade nos atendimentos — o repositório no GitHub tem uma cópia dele. Pretendo colocar lá capturas de tela reais (com os dados protegidos) e caprichar mais na documentação.',
        status: { text: 'EM USO REAL · DADOS REAIS', live: true },
        links: [
          { href: 'https://github.com/samymallmann/acompanhamento-em-saude', label: 'Ver no GitHub', type: 'code' }
        ]
      },
      blackjack: {
        addr: '0x04.2 · REPOSITÓRIO PÚBLICO',
        title: 'Blackjack em Verilog (FPGA)',
        tags: ['Verilog', 'FSM', 'FPGA', 'Quartus Prime'],
        body: [
          'Jogo de Blackjack completo, implementado em Verilog pra rodar numa placa DE10-Lite. Uma máquina de estados controla toda a partida — da distribuição das cartas até a comparação de mãos no final.',
          'As cartas são geradas pseudoaleatoriamente e o Ás é tratado como valor flexível (1 ou 11), seguindo a regra real do jogo. O resultado da rodada aparece direto nos displays de 7 segmentos e nos LEDs da placa — é tudo hardware descrito em Verilog, sem software rodando por cima.'
        ],
        video: 'oDG7Yr56WwU',
        links: [
          { href: 'https://github.com/samymallmann/Blackjack-verilog-fpga', label: 'Ver no GitHub', type: 'code' }
        ]
      },
      bancario: {
        addr: '0x04.3 · REPOSITÓRIO PÚBLICO',
        title: 'Sistema Bancário Concorrente',
        tags: ['C', 'pthreads', 'Mutexes & Semáforos'],
        body: [
          'Projeto feito pra disciplina de Sistemas Operacionais: uma simulação de operações bancárias concorrentes em C, implementando dois problemas clássicos de sincronização — Leitores-Escritores e Produtor-Consumidor — com threads POSIX, mutexes e semáforos.',
          'A ideia é mostrar na prática os erros de leitura e escrita que aparecem quando várias threads acessam e alteram os mesmos dados ao mesmo tempo: as condições de corrida. O projeto roda as mesmas operações com e sem sincronização, pra comparar o grau de erro entre as duas versões e deixar visível exatamente o problema que mutexes e semáforos resolvem.'
        ],
        status: { text: 'PRONTO', live: true },
        links: [
          { href: 'https://github.com/samymallmann/sistema-bancario-concorrente', label: 'Ver no GitHub', type: 'code' }
        ]
      },
      mips: {
        addr: '0x04.4 · EM DESENVOLVIMENTO',
        title: 'Processador MIPS com Pipeline',
        tags: ['Verilog', 'MIPS', 'Pipeline'],
        body: [
          'Processador MIPS com pipeline de 5 estágios (IF, ID, EX, MEM, WB) descrito em Verilog, tratando hazards de controle, dados e estruturais.',
          'Está sendo embarcado numa FPGA e testado rodando um algoritmo de ordenação. É o projeto atual da disciplina de Arquitetura de Sistemas Digitais — o repositório vai ao ar assim que a avaliação terminar.'
        ],
        status: { text: 'REPOSITÓRIO APÓS AVALIAÇÃO', live: false }
      }
    };

    // mock de tela com nomes/telefones borrados — são idosos atendidos reais, não dá pra expor
    function renderMock(){
      return '' +
        '<div class="privacy-mock">' +
          '<div class="privacy-mock-head"><span>Nome</span><span>Nascimento</span><span>Idade</span><span>Telefone</span></div>' +
          '<div class="privacy-mock-row"><span class="blur-text">Nome do atendido</span><span>04/11/1952</span><span>73 anos</span><span class="blur-text">(92) 98888-2222</span></div>' +
          '<div class="privacy-mock-row"><span class="blur-text">Nome do atendido</span><span>12/03/1948</span><span>78 anos</span><span class="blur-text">(92) 98888-1111</span></div>' +
          '<div class="privacy-mock-row"><span class="blur-text">Nome do atendido</span><span>21/07/1945</span><span>81 anos</span><span class="blur-text">(92) 98888-3333</span></div>' +
          '<div class="privacy-mock-caption">Nomes e telefones borrados de propósito — são idosos atendidos reais.</div>' +
        '</div>';
    }

    // capa do YouTube com botão de play — só carrega o vídeo de verdade (iframe) quando clicado
    function renderVideo(videoId){
      return '' +
        '<div class="yt-embed" data-yt="' + videoId + '">' +
          '<img src="https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg" alt="Capa do vídeo de demonstração" loading="lazy">' +
          '<button type="button" class="yt-embed-play" aria-label="Reproduzir vídeo de demonstração">' +
            '<span>' + iconPlay + '</span>' +
          '</button>' +
        '</div>';
    }

    function renderProject(id){
      var p = projects[id];
      if (!p) return '';
      var tagsHtml = p.tags.map(function(t){ return '<span class="tag">' + t + '</span>'; }).join('');
      var bodyHtml = p.body.map(function(par){ return '<p>' + par + '</p>'; }).join('');
      var videoHtml = p.video ? renderVideo(p.video) : '';
      var mockHtml = p.mock ? renderMock() : '';
      var noteHtml = p.note ? '<p class="project-modal-note">' + p.note + '</p>' : '';
      var statusHtml = p.status ? '<div class="status-pill"><span class="dot' + (p.status.live ? ' live' : '') + '"></span>' + p.status.text + '</div>' : '';
      var linksHtml = (p.links && p.links.length)
        ? '<div class="project-modal-links">' + p.links.map(function(l){
            var icon = l.type === 'demo' ? iconPlay : iconCode;
            return '<a href="' + l.href + '" target="_blank" rel="noopener" data-cursor="link">' + icon + l.label + '</a>';
          }).join('') + '</div>'
        : '';

      return '' +
        '<div class="project-modal-addr">' + p.addr + '</div>' +
        '<h3 id="modalTitle">' + p.title + '</h3>' +
        '<div class="project-modal-tags">' + tagsHtml + '</div>' +
        '<div class="project-modal-body">' + bodyHtml + '</div>' +
        videoHtml + mockHtml + noteHtml + statusHtml + linksHtml;
    }

    // troca a capa pelo player de verdade só quando o visitante clica em play
    function wireVideoEmbeds(){
      modalContent.querySelectorAll('.yt-embed-play').forEach(function(btn){
        btn.addEventListener('click', function(){
          var wrap = btn.closest('.yt-embed');
          var videoId = wrap.getAttribute('data-yt');
          wrap.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0" title="Demonstração em vídeo" allow="accelerate-transformer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
        });
      });
    }

    function openModal(id){
      if (!projects[id]) return;
      lastFocused = document.activeElement;
      modalContent.innerHTML = renderProject(id);
      wireVideoEmbeds();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      modalPanel.focus();
    }

    function closeModal(){
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    document.querySelectorAll('.project-card[data-project]').forEach(function(card){
      card.addEventListener('click', function(e){
        if (e.target.closest('a')) return; // deixa "Ver no GitHub" / "Ver demonstração" funcionarem normalmente
        openModal(card.getAttribute('data-project'));
      });
      card.addEventListener('keydown', function(e){
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')){
          e.preventDefault();
          openModal(card.getAttribute('data-project'));
        }
      });
    });

    modal.querySelectorAll('[data-modal-close]').forEach(function(el){
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  })();

  /* ---------- 6) Canvas do hero: trilhas de circuito + pulso ---------- */
  (function(){
    var canvas = document.getElementById('hero-canvas');
    var ctx = canvas.getContext('2d');
    var hero = document.querySelector('.hero');
    var paths = [];      // cada trilha é uma lista de pontos {x,y}
    var pulses = [];      // pulsos viajando sobre uma trilha
    var parallaxX = 0, parallaxY = 0;

    function resize(){
      canvas.width = hero.clientWidth + 80;
      canvas.height = hero.clientHeight + 80;
      buildPaths();
    }

    // gera trilhas em "L", como roteamento de PCB, numa grade
    function buildPaths(){
      paths = [];
      var cols = Math.max(6, Math.floor(canvas.width / 140));
      var rows = Math.max(4, Math.floor(canvas.height / 140));
      var stepX = canvas.width / cols;
      var stepY = canvas.height / rows;
      var count = Math.min(14, Math.floor(cols * rows * 0.18));

      for (var i = 0; i < count; i++){
        var startCol = Math.floor(Math.random() * cols);
        var startRow = Math.floor(Math.random() * rows);
        var x = startCol * stepX;
        var y = startRow * stepY;
        var pts = [{ x: x, y: y }];
        var segments = 2 + Math.floor(Math.random() * 3);
        for (var s = 0; s < segments; s++){
          if (s % 2 === 0){
            x += (Math.random() > 0.5 ? 1 : -1) * stepX * (1 + Math.floor(Math.random() * 2));
          } else {
            y += (Math.random() > 0.5 ? 1 : -1) * stepY * (1 + Math.floor(Math.random() * 2));
          }
          pts.push({ x: x, y: y });
        }
        paths.push(pts);
      }

      // alguns pulsos percorrendo trilhas aleatórias
      pulses = [];
      for (var p = 0; p < Math.min(5, paths.length); p++){
        pulses.push({
          pathIndex: Math.floor(Math.random() * paths.length),
          progress: Math.random(),
          speed: 0.0022 + Math.random() * 0.002
        });
      }
    }

    function totalLength(pts){
      var len = 0;
      for (var i = 1; i < pts.length; i++){
        len += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
      }
      return len;
    }

    function pointAt(pts, t){
      var target = totalLength(pts) * t;
      var acc = 0;
      for (var i = 1; i < pts.length; i++){
        var segLen = Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
        if (acc + segLen >= target){
          var localT = segLen === 0 ? 0 : (target - acc) / segLen;
          return {
            x: pts[i-1].x + (pts[i].x - pts[i-1].x) * localT,
            y: pts[i-1].y + (pts[i].y - pts[i-1].y) * localT
          };
        }
        acc += segLen;
      }
      return pts[pts.length - 1];
    }

    function draw(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(parallaxX, parallaxY);

      // trilhas estáticas, bem discretas
      ctx.strokeStyle = 'rgba(124,158,184,0.16)';
      ctx.lineWidth = 1;
      paths.forEach(function(pts){
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      });

      // pulsos animados usando o degradê de azuis
      if (!prefersReducedMotion){
        pulses.forEach(function(pulse){
          pulse.progress += pulse.speed;
          if (pulse.progress > 1) pulse.progress = 0;
          var pts = paths[pulse.pathIndex];
          if (!pts) return;
          var pos = pointAt(pts, pulse.progress);
          var gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 14);
          gradient.addColorStop(0, 'rgba(191,228,245,0.9)');
          gradient.addColorStop(0.4, 'rgba(87,168,220,0.5)');
          gradient.addColorStop(1, 'rgba(87,168,220,0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#bfe4f5';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    requestAnimationFrame(draw);

    // parallax sutil ao mover o mouse dentro do hero
    if (enableFancyStuff){
      hero.addEventListener('mousemove', function(e){
        var rect = hero.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5;
        var relY = (e.clientY - rect.top) / rect.height - 0.5;
        parallaxX = relX * -14;
        parallaxY = relY * -14;
      });
      hero.addEventListener('mouseleave', function(){
        parallaxX = 0;
        parallaxY = 0;
      });
    }
  })();
