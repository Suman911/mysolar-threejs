import * as THREE from 'three';

// Planet Data
const PLANETS = [
    { name: "Mercury", color: 0xa9a9a9, size: 1.6, orbitRadius: 18, speed: 0.7 },
    { name: "Venus", color: 0xf5deb3, size: 2.9, orbitRadius: 25, speed: 0.5 },
    { name: "Earth", color: 0x3399ff, size: 3.1, orbitRadius: 34, speed: 0.4 },
    { name: "Mars", color: 0xff6f3c, size: 2.2, orbitRadius: 43, speed: 0.3 },
    { name: "Jupiter", color: 0xf9e6be, size: 6.8, orbitRadius: 60, speed: 0.2 },
    { name: "Saturn", color: 0xf5e9b2, size: 5.8, orbitRadius: 75, speed: 0.16 },
    { name: "Uranus", color: 0xafeefe, size: 4.2, orbitRadius: 88, speed: 0.10 },
    { name: "Neptune", color: 0x4169e1, size: 4.1, orbitRadius: 100, speed: 0.09 }
];

// Sun Data
const SUN = { color: 0xfce300, size: 10 };

// Setup Three.js Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Add subtle starry background
scene.background = new THREE.Color(0x101022);
function addStars(n = 800) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < n; i++) {
        const x = THREE.MathUtils.randFloatSpread(320);
        const y = THREE.MathUtils.randFloatSpread(200);
        const z = THREE.MathUtils.randFloatSpread(320);
        vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}
addStars();

// Camera
const camera = new THREE.PerspectiveCamera(
    70,
    container.offsetWidth / container.offsetHeight,
    0.5,
    300
);
camera.position.set(0, 40, 125);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Enable physically based rendering
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2; // Increased exposure

// Resize handler
window.addEventListener('resize', () => {
    const w = container.offsetWidth, h = container.offsetHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
});

// LIGHTING - Enhanced lighting setup
const sunLight = new THREE.PointLight(SUN.color, 50, 1000);
sunLight.position.set(0, 25, 0);
sunLight.decay = 0.8; // Reduced decay
scene.add(sunLight);

// Add ambient light to fill in shadows
const ambientLight = new THREE.AmbientLight(0x333333); // Soft ambient light
scene.add(ambientLight);

// SUN - Fixed material and enhanced glow
const sunGeometry = new THREE.SphereGeometry(SUN.size, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: SUN.color
});
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 25, 0);
scene.add(sunMesh);

// PLANETS - Enhanced visibility
const planetMeshes = [];
const orbitAngles = [];

// Create a ring for Saturn
const saturnRingGeometry = new THREE.RingGeometry(8, 10, 64);
const saturnRingMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5e9b2,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    metalness: 0.3,
    roughness: 0.7
});
const saturnRing = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
saturnRing.rotation.x = Math.PI / 2;

PLANETS.forEach((planet, i) => {
    // Sphere with enhanced visibility
    const geometry = new THREE.SphereGeometry(planet.size, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: planet.color,
        roughness: 0.8,
        metalness: 0.5, // Reduced metalness for better visibility
        flatShading: false
    });
    
    const mesh = new THREE.Mesh(geometry, material);

    // Initial position
    const angle = Math.random() * Math.PI * 2;
    mesh.position.set(
        Math.cos(angle) * planet.orbitRadius,
        25,
        Math.sin(angle) * planet.orbitRadius
    );
    orbitAngles.push(angle);

    // Add planet to scene
    scene.add(mesh);
    planetMeshes.push(mesh);

    // Add Saturn's ring
    if (planet.name === "Saturn") {
        saturnRing.position.copy(mesh.position);
        scene.add(saturnRing);
    }

    // Add orbit ring
    const orbitGeometry = new THREE.RingGeometry(
        planet.orbitRadius - 0.2, planet.orbitRadius + 0.2, 120
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(orbitGeometry, orbitMaterial);
    ring.position.set(0, 25, 0);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
});

// Planet Speed Controls
const speedForm = document.getElementById('speed-form');
PLANETS.forEach((planet, idx) => {
    // Container
    const controlDiv = document.createElement('div');
    controlDiv.className = 'slider-container';

    // Label
    const label = document.createElement('label');
    label.htmlFor = `slider-${idx}`;
    label.textContent = planet.name;
    label.style.color = "#ffe066";
    label.style.fontWeight = "bold";
    label.style.minWidth = "80px";

    // Range slider
    const slider = document.createElement('input');
    slider.type = "range";
    slider.min = "0.01";
    slider.max = "1.0";
    slider.step = "0.01";
    slider.value = planet.speed;
    slider.id = `slider-${idx}`;
    slider.className = "planet-slider";

    // Number input
    const number = document.createElement('input');
    number.type = "number";
    number.min = "0.01";
    number.max = "1.0";
    number.step = "0.01";
    number.value = planet.speed;
    number.id = `number-${idx}`;

    // Sync slider/number
    slider.addEventListener('input', () => {
        number.value = slider.value;
        PLANETS[idx].speed = parseFloat(slider.value);
    });
    number.addEventListener('input', () => {
        let val = Math.max(0.01, Math.min(1.0, parseFloat(number.value)));
        slider.value = val;
        PLANETS[idx].speed = val;
        number.value = val;
    });

    // Layout
    controlDiv.appendChild(label);
    controlDiv.appendChild(slider);
    controlDiv.appendChild(number);
    speedForm.appendChild(controlDiv);
});

// Pause/Play Controls
let paused = false;
const pauseBtn = document.getElementById('pause-btn');
const playBtn = document.getElementById('play-btn');

pauseBtn.addEventListener('click', () => {
    paused = true;
    pauseBtn.style.display = 'none';
    playBtn.style.display = '';
});
playBtn.addEventListener('click', () => {
    paused = false;
    playBtn.style.display = 'none';
    pauseBtn.style.display = '';
});

// Animation Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    if (!paused) {
        // Animate planets
        const dt = clock.getDelta();
        PLANETS.forEach((planet, idx) => {
            orbitAngles[idx] += dt * planet.speed * 0.7;
            const mesh = planetMeshes[idx];
            mesh.position.x = Math.cos(orbitAngles[idx]) * planet.orbitRadius;
            mesh.position.y = 25; // Fixed height for better visibility
            mesh.position.z = Math.sin(orbitAngles[idx]) * planet.orbitRadius;

            // Update Saturn's ring position
            if (planet.name === "Saturn") {
                saturnRing.position.copy(mesh.position);
            }
        });
    }

    renderer.render(scene, camera);
}
animate();

// Accessibility: Keyboard navigation for sliders
speedForm.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') slider.stepDown();
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') slider.stepUp();
        slider.dispatchEvent(new Event('input'));
    });
});

// Tooltips on hover
planetMeshes.forEach((mesh, idx) => {
    mesh.userData.planetIdx = idx;
});

renderer.domElement.addEventListener('mousemove', function (e) {
    const mouse = new THREE.Vector2(
        (e.offsetX / renderer.domElement.clientWidth) * 2 - 1,
        -(e.offsetY / renderer.domElement.clientHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes);
    const tooltipId = 'planet-tooltip';
    let tooltip = document.getElementById(tooltipId);

    if (intersects.length > 0) {
        const idx = intersects[0].object.userData.planetIdx;
        const planet = PLANETS[idx];
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = tooltipId;
            tooltip.style.position = 'fixed';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.background = '#222b';
            tooltip.style.color = '#ffe066';
            tooltip.style.padding = '8px 16px';
            tooltip.style.borderRadius = '8px';
            tooltip.style.fontSize = '1.1em';
            tooltip.style.fontWeight = 'bold';
            tooltip.style.zIndex = 100;
            tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            tooltip.style.border = '1px solid rgba(255, 224, 102, 0.3)';
            document.body.appendChild(tooltip);
        }
        tooltip.textContent = planet.name;
        tooltip.style.left = (e.clientX + 20) + 'px';
        tooltip.style.top = (e.clientY - 5) + 'px';
        tooltip.style.display = 'block';
    } else if (tooltip) {
        tooltip.style.display = 'none';
    }
});

// Add rotation controls for desktop
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

renderer.domElement.addEventListener('mousedown', function (e) {
    isDragging = true;
});

renderer.domElement.addEventListener('mousemove', function (e) {
    const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
    };

    if (isDragging) {
        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                toRadians(deltaMove.y * 0.5),
                toRadians(deltaMove.x * 0.5),
                0,
                'XYZ'
            ));

        camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, camera.quaternion);
    }

    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});

document.addEventListener('mouseup', function () {
    isDragging = false;
});

function toRadians(angle) {
    return angle * (Math.PI / 180);
}