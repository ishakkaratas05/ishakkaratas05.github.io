/* ==========================================================================
   İSHAK KARATAŞ PORTFOLIO - MAIN JAVASCRIPT
   Interactions: Theme Toggle, 3D Badge Tilt, Smooth Scroll, Mobile Drawer,
   Scientific Background Particle Canvas, Clipboard Toast
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. TEMA DEĞİŞTİRİCİ (DARK/LIGHT MODE TOGGLE)
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
        });
    }

    // ----------------------------------------------------------------------
    // 2. MOBİL MENÜ DRAWER
    // ----------------------------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // ----------------------------------------------------------------------
    // 3. SCROLLED NAVBAR & ACTIVE LINK INDICATOR
    // ----------------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Floating Back to Top Button Visibility has been removed

        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    });

    // ----------------------------------------------------------------------
    // 4. BİLİMSEL ARKA PLAN CANVAS PARTİKÜL MESH ANİMASYONU
    // ----------------------------------------------------------------------
    initScientificCanvas();

    // ----------------------------------------------------------------------
    // 5. MATTER.JS PHYSICS — REALISTIC HANGING BADGE CARD
    // ----------------------------------------------------------------------
    initBadgePhysics();

    // Quick Copy Email Event
    const quickCopyBtn = document.getElementById('quick-copy-email');
    if (quickCopyBtn) {
        quickCopyBtn.addEventListener('click', () => {
            const email = quickCopyBtn.getAttribute('data-email') || 'ishakkaratas.tech@gmail.com';
            copyEmailToClipboard(email);
        });
    }

    // ----------------------------------------------------------------------
    // 5.5 GÖRSEL & VİDEO KOPYALAMA VE SÜRÜKLEME KORUMASI
    // ----------------------------------------------------------------------
    // Görsel ve videolara sağ tıklanmasını engeller (Farklı kaydet veya yeni sekmede aç koruması)
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            e.preventDefault();
        }
    });

    // Görsellerin ve videoların sürüklenerek masaüstüne veya yeni sekmeye atılmasını engeller
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            e.preventDefault();
        }
    });
});

// --------------------------------------------------------------------------
// 6. BİLİMSEL CANVAS HAREKETLİ AĞ (NETWORK MESH) ALGORİTMASI
// --------------------------------------------------------------------------
function initScientificCanvas() {
    const canvas = document.getElementById('bg-scientific-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const numParticles = 42;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            radius: Math.random() * 2.2 + 1.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const nodeColor = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.25)';
        const lineColor = isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(79, 70, 229, 0.06)';

        for (let i = 0; i < numParticles; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = nodeColor;
            ctx.fill();

            for (let j = i + 1; j < numParticles; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// --------------------------------------------------------------------------
// 7. GLOBAL CLIPBOARD COPY UTILITY & TOAST NOTIFICATION
// --------------------------------------------------------------------------
function copyEmailToClipboard(emailText) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(emailText).then(() => {
            showToast(`"${emailText}" panoya kopyalandı!`);
        }).catch(err => {
            fallbackCopyTextToClipboard(emailText);
        });
    } else {
        fallbackCopyTextToClipboard(emailText);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast(`"${text}" panoya kopyalandı!`);
    } catch (err) {
        showToast('Kopyalama başarısız oldu.');
    }
    document.body.removeChild(textArea);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3500);
    }
}

// ======================================================================
// MATTER.JS — REALISTIC HANGING BADGE CARD PHYSICS
// ======================================================================
function initBadgePhysics() {
    const area = document.getElementById('badge-physics-area');
    const canvas = document.getElementById('badge-physics-canvas');
    const cardDom = document.getElementById('badge-card-dom');
    if (!area || !canvas || !cardDom || typeof Matter === 'undefined') return;

    const { Engine, World, Bodies, Body, Constraint, Mouse, MouseConstraint, Events } = Matter;

    // Dimensions
    const W = area.offsetWidth || 340;
    const H = area.offsetHeight || 520;
    const CARD_W = 300;
    const CARD_H = 388;
    const ROPE_SEGMENTS = 12;
    const ROPE_SEG_LEN = 15;
    const ROPE_SEG_R = 3;

    // Canvas setup (HiDPI)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Physics engine
    const engine = Engine.create({
        gravity: { x: 0, y: 1.8 }
    });
    const world = engine.world;

    // Anchor point (fixed, top edge, perfectly centered on all devices)
    const anchorX = W / 2;
    const anchorY = 0;

    // Rope chain (small circle bodies)
    const ropeLinks = [];
    for (let i = 0; i < ROPE_SEGMENTS; i++) {
        const link = Bodies.circle(anchorX, anchorY + (i + 1) * ROPE_SEG_LEN, ROPE_SEG_R, {
            density: 0.05, // Increased density so links aren't infinitely lighter than card
            friction: 0.6,
            frictionAir: 0.02,
            restitution: 0.1,
            collisionFilter: { group: -1 },
            render: { visible: false }
        });
        ropeLinks.push(link);
    }
    World.add(world, ropeLinks);

    // Card body
    const cardStartY = anchorY + (ROPE_SEGMENTS + 1) * ROPE_SEG_LEN + CARD_H / 2;
    const cardBody = Bodies.rectangle(anchorX, cardStartY, CARD_W * 0.85, CARD_H * 0.85, {
        density: 0.001, // Decreased density to prevent stretching the rope
        friction: 0.5,
        frictionAir: 0.05,
        restitution: 0.08,
        collisionFilter: { group: -1 },
        render: { visible: false }
    });
    World.add(world, cardBody);

    // Constraints: anchor -> first link
    const constraints = [];
    constraints.push(Constraint.create({
        pointA: { x: anchorX, y: anchorY },
        bodyB: ropeLinks[0],
        length: ROPE_SEG_LEN,
        stiffness: 1, // Max stiffness
        damping: 0.1,
        render: { visible: false }
    }));

    // Link-to-link constraints
    for (let i = 1; i < ROPE_SEGMENTS; i++) {
        constraints.push(Constraint.create({
            bodyA: ropeLinks[i - 1],
            bodyB: ropeLinks[i],
            length: ROPE_SEG_LEN,
            stiffness: 1, // Max stiffness
            damping: 0.1,
            render: { visible: false }
        }));
    }

    // Last link -> card top center
    constraints.push(Constraint.create({
        bodyA: ropeLinks[ROPE_SEGMENTS - 1],
        bodyB: cardBody,
        pointB: { x: 0, y: -CARD_H * 0.85 / 2 },
        length: ROPE_SEG_LEN,
        stiffness: 1, // Max stiffness
        damping: 0.1,
        render: { visible: false }
    }));

    World.add(world, constraints);

    // Mouse interaction (on canvas which receives pointer events)
    const mouse = Mouse.create(canvas);
    mouse.pixelRatio = dpr;

    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            damping: 0.1,
            render: { visible: false }
        }
    });
    World.add(world, mouseConstraint);

    // Prevent page scroll on touch drag
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const px = (touch.clientX - rect.left) * (W / rect.width);
        const py = (touch.clientY - rect.top) * (H / rect.height);
        const dx = px - cardBody.position.x;
        const dy = py - cardBody.position.y;
        if (Math.abs(dx) < CARD_W / 2 && Math.abs(dy) < CARD_H / 2) {
            e.preventDefault();
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (mouseConstraint.body) {
            e.preventDefault();
        }
    }, { passive: false });

    // Render loop
    function render() {
        Engine.update(engine, 1000 / 60);

        ctx.clearRect(0, 0, W, H);

        // Collect rope points
        const points = [{ x: anchorX, y: anchorY }];
        for (const link of ropeLinks) {
            points.push({ x: link.position.x, y: link.position.y });
        }
        // Card top center
        const cosA = Math.cos(cardBody.angle);
        const sinA = Math.sin(cardBody.angle);
        const halfH = CARD_H * 0.85 / 2;
        const topCenterX = cardBody.position.x + sinA * halfH;
        const topCenterY = cardBody.position.y - cosA * halfH;
        points.push({ x: topCenterX, y: topCenterY });

        // Draw shadow for lanyard
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x + 3, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x + 3, points[i].y + 3);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 20;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();

        // Draw thick black strap
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#111'; // Dark black flat strap
        ctx.lineWidth = 18;
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Slight sheen on strap
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();

        // Draw Clip (Buckle & Hook)
        const lastPt = points[points.length - 1];
        const prevPt = points[points.length - 2];
        const clipAngle = Math.atan2(lastPt.y - prevPt.y, lastPt.x - prevPt.x);
        
        ctx.save();
        ctx.translate(lastPt.x, lastPt.y);
        ctx.rotate(clipAngle - Math.PI / 2);
        
        // 1. Black Plastic Buckle
        ctx.fillStyle = '#111';
        // Buckle top loop (connects to strap)
        ctx.fillRect(-12, -22, 24, 12);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.strokeRect(-12, -22, 24, 12);
        // Buckle bottom body
        ctx.beginPath();
        ctx.roundRect(-8, -10, 16, 12, 3);
        ctx.fill();

        // 2. Silver Metal Hook
        const hookGrad = ctx.createLinearGradient(-4, 0, 4, 0);
        hookGrad.addColorStop(0, '#71717a');
        hookGrad.addColorStop(0.5, '#e4e4e7');
        hookGrad.addColorStop(1, '#52525b');
        ctx.fillStyle = hookGrad;
        
        // Hook swivel base
        ctx.fillRect(-3, 2, 6, 6);
        // Hook body
        ctx.beginPath();
        ctx.roundRect(-5, 8, 10, 12, 5);
        ctx.fill();
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        ctx.restore();

        // Sync DOM card
        const cx = cardBody.position.x;
        const cy = cardBody.position.y;
        const angle = cardBody.angle;
        cardDom.style.transform = `translate(${cx - CARD_W / 2}px, ${cy - CARD_H / 2}px) rotate(${angle}rad)`;

        requestAnimationFrame(render);
    }

    render();

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const newW = area.offsetWidth;
            const newH = area.offsetHeight;
            canvas.width = newW * dpr;
            canvas.height = newH * dpr;
            canvas.style.width = newW + 'px';
            canvas.style.height = newH + 'px';
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        }, 200);
    });
}
