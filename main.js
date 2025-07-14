import * as THREE from 'three';

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
const SUN = { color: 0xffc400, size: 10 };

// Setup Three.js Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Add subtle starry background
scene.background = new THREE.Color(0x101022);
function addStars(n = 1000) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < n; i++) {
        const x = THREE.MathUtils.randFloatSpread(320);
        const y = THREE.MathUtils.randFloatSpread(200) + 30;
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
camera.position.set(0, 45, 135);

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
const sunLight = new THREE.PointLight(SUN.color, 75, 1000);
sunLight.position.set(0, 30, 0);
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
sunMesh.position.set(0, 30, 0);
scene.add(sunMesh);

// PLANETS - Enhanced visibility
const planetMeshes = [];
const orbitAngles = [];
const initialOrbitAngles = [];

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
        30,
        Math.sin(angle) * planet.orbitRadius
    );
    orbitAngles.push(angle);
    initialOrbitAngles.push(angle);

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
    ring.position.set(0, 30, 0);
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

    // Layout
    const sliderRow = document.createElement('div');
    sliderRow.className = 'slider-row';
    sliderRow.appendChild(slider);
    sliderRow.appendChild(number);

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

    // Append elements
    controlDiv.appendChild(label);
    controlDiv.appendChild(sliderRow);
    speedForm.appendChild(controlDiv);
});

// Pause/Play Controls
let paused = false;
const pauseBtn = document.getElementById('pause-btn');
const playBtn = document.getElementById('play-btn');
const resetBtn = document.getElementById('reset-btn');
const topViewBtn = document.getElementById('top-view');
const sideViewBtn = document.getElementById('side-view');
const statusText = document.getElementById('status-text');
const statusIndicator = document.getElementById('status-indicator');

// Update status display
function updateStatus() {
    if (paused) {
        statusText.textContent = "Simulation Paused";
        statusIndicator.className = "status-indicator paused";
    } else {
        statusText.textContent = "Simulation Running";
        statusIndicator.className = "status-indicator";
    }
}

pauseBtn.addEventListener('click', () => {
    paused = true;
    updateStatus();
    pauseBtn.style.display = "none";
    playBtn.style.display = "inline-block";
});
playBtn.addEventListener('click', () => {
    paused = false;
    updateStatus();
    playBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
});

resetBtn.addEventListener('click', () => {
    // Reset all planets to initial positions
    PLANETS.forEach((planet, idx) => {
        orbitAngles[idx] = initialOrbitAngles[idx];
        const mesh = planetMeshes[idx];
        mesh.position.x = Math.cos(orbitAngles[idx]) * planet.orbitRadius;
        mesh.position.y = 30;
        mesh.position.z = Math.sin(orbitAngles[idx]) * planet.orbitRadius;

        // Reset Saturn's ring
        if (planet.name === "Saturn") {
            saturnRing.position.copy(mesh.position);
        }
    });
});

// Camera views
topViewBtn.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: 0,
        y: 200,
        z: 0,
        duration: 1.5,
        ease: "power2.inOut"
    });
    gsap.to(camera.rotation, {
        x: -Math.PI / 2,
        duration: 1.5,
        ease: "power2.inOut"
    });
    topViewBtn.style.display = "none";
    sideViewBtn.style.display = "inline-block";
});

sideViewBtn.addEventListener('click', () => {
    gsap.to(camera.position, {
        x: 0,
        y: 45,
        z: 135,
        duration: 1.5,
        ease: "power2.inOut"
    });
    gsap.to(camera.rotation, {
        x: 0,
        duration: 1.5,
        ease: "power2.inOut"
    });
    sideViewBtn.style.display = "none";
    topViewBtn.style.display = "inline-block";
});

// Animation Loop
let lastTime = 0;
function animate(timestamp) {
    requestAnimationFrame(animate);

    // Calculate delta time
    const deltaTime = paused ? 0 : (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!paused) {
        // Animate planets
        PLANETS.forEach((planet, idx) => {
            orbitAngles[idx] += deltaTime * planet.speed * 0.7;
            const mesh = planetMeshes[idx];
            mesh.position.x = Math.cos(orbitAngles[idx]) * planet.orbitRadius;
            mesh.position.y = 30;
            mesh.position.z = Math.sin(orbitAngles[idx]) * planet.orbitRadius;

            // Update Saturn's ring position
            if (planet.name === "Saturn") {
                saturnRing.position.copy(mesh.position);
            }
        });
    }

    renderer.render(scene, camera);
}
animate(0);
updateStatus();

// Accessibility: Keyboard navigation for sliders
speedForm.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') slider.stepDown();
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') slider.stepUp();
        slider.dispatchEvent(new Event('input'));
    });
});

// Planet labels
const planetLabel = document.getElementById('planet-label');
planetMeshes.forEach((mesh, idx) => {
    mesh.userData = {
        planetIdx: idx,
        name: PLANETS[idx].name
    };
});

renderer.domElement.addEventListener('mousemove', function (e) {
    const mouse = new THREE.Vector2(
        (e.offsetX / renderer.domElement.clientWidth) * 2 - 1,
        -(e.offsetY / renderer.domElement.clientHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const planetName = intersects[0].object.userData.name;
        planetLabel.textContent = planetName;
        planetLabel.style.opacity = "1";
        planetLabel.style.left = `${e.clientX + 20}px`;
        planetLabel.style.top = `${e.clientY - 10}px`;
    } else {
        planetLabel.style.opacity = "0";
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

// Add GSAP for smooth camera animations
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js';
document.head.appendChild(script);

// Initialize button visibility on load
pauseBtn.style.display = "inline-block";
playBtn.style.display = "none";
topViewBtn.style.display = "inline-block";
sideViewBtn.style.display = "none";