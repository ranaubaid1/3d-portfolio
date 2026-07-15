import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

// Speech bubble elements and utility
const mainBubble = document.getElementById("robot-speech-bubble");
let bubbleTimeout = null;

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Filter emojis
        const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.15; // friendly companion pitch
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
        if (preferredVoice) utterance.voice = preferredVoice;
        
        window.speechSynthesis.speak(utterance);
    }
}

function showBubble(text, duration = 3000) {
    if (!mainBubble) return;
    mainBubble.textContent = text;
    mainBubble.classList.add("show");
    
    // Speak bubble aloud
    speakText(text);
    
    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
        mainBubble.classList.remove("show");
    }, duration);
}

// ---------------------------------------------------------------------
// 1. FULL-SCREEN 3D INTERACTIVE BACKDROP CANVAS ENGINE
// ---------------------------------------------------------------------
function init3DEngine() {
    const canvas = document.getElementById("three-canvas");
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    
    // Smooth cinematic cameras setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(width, height);
    // Cap pixel ratio to max 2 for huge GPU performance optimization on high-DPI screens
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dynamic lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Orbiting Spotlight Colors (casting dynamic metallic specular highlights on the robot)
    const cyanLight = new THREE.PointLight(0x00f7ff, 7, 12);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff00ff, 7, 12);
    scene.add(magentaLight);

    // Glowing Cyber Grid Helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x00f7ff, 0x1e293b);
    gridHelper.position.y = -2.2;
    scene.add(gridHelper);

    // Starfield Particle Galaxy
    const particleCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 28;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.06,
        color: 0x00f7ff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    const starfield = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(starfield);

    // Floating Geometries (Parallax Objects)
    const shapes = [];
    const geoms = [
        new THREE.TorusGeometry(0.8, 0.2, 8, 24),
        new THREE.OctahedronGeometry(0.7, 0),
        new THREE.IcosahedronGeometry(0.6, 0),
        new THREE.TorusGeometry(0.5, 0.15, 8, 16)
    ];

    const shapePositions = [
        new THREE.Vector3(-4, 1.8, -3),
        new THREE.Vector3(4, -1.2, -4),
        new THREE.Vector3(-3.2, -1.8, -2),
        new THREE.Vector3(3.2, 2.2, -3)
    ];

    for (let i = 0; i < geoms.length; i++) {
        const material = new THREE.MeshBasicMaterial({
            color: 0x00f7ff,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        const mesh = new THREE.Mesh(geoms[i], material);
        mesh.position.copy(shapePositions[i]);
        scene.add(mesh);
        shapes.push(mesh);
    }

    // Dynamic Spark Particles Trail (Pool Pre-Allocation)
    const sparkPool = [];
    const maxSparks = 60;
    const sparkGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    
    for (let i = 0; i < maxSparks; i++) {
        const material = new THREE.MeshBasicMaterial({
            color: 0x00f7ff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        const mesh = new THREE.Mesh(sparkGeometry, material);
        mesh.visible = false;
        scene.add(mesh);
        sparkPool.push({
            mesh: mesh,
            velocity: new THREE.Vector3(),
            life: 0,
            decay: 0
        });
    }

    function spawnSpark(x, y) {
        // Find an inactive spark
        const spark = sparkPool.find(s => s.life <= 0);
        if (!spark) return;

        // Project mouse coordinate on z=0 plane
        const vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));

        spark.mesh.position.copy(pos);
        spark.mesh.position.x += (Math.random() - 0.5) * 0.15;
        spark.mesh.position.y += (Math.random() - 0.5) * 0.15;

        spark.mesh.visible = true;
        spark.mesh.material.opacity = 1.0;

        spark.velocity.set(
            (Math.random() - 0.5) * 0.03,
            (Math.random() - 0.5) * 0.03 + 0.01, // upward drift
            (Math.random() - 0.5) * 0.03
        );

        spark.life = 1.0;
        const maxLife = 20 + Math.random() * 20;
        spark.decay = 1.0 / maxLife;
    }

    // Load main robot model
    let robot = null;
    let baselineScale = 1.35;
    let scaleTarget = baselineScale;
    let currentScale = baselineScale;

    // Interaction variables
    let isHovered = false;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Physics parameters for Jumps and Spins
    let isSpinning = false;
    let spinVelocity = 0;
    let isJumping = false;
    let jumpVelocity = 0;
    let jumpYOffset = 0;
    const gravity = 0.008;

    loader.load(
        "assets/models/robot.glb",
        function (gltf) {
            robot = gltf.scene;
            robot.scale.set(baselineScale, baselineScale, baselineScale);
            robot.position.set(1.5, -2.0, 0); // Positioned slightly to the right to fit Hero text
            scene.add(robot);

            setTimeout(() => {
                showBubble("Welcome to Ubaid's 3D Portfolio! 🚀", 4000);
            }, 500);
        },
        undefined,
        function (error) {
            console.error("Robot Loading Error:", error);
        }
    );

    // Camera routing fly coordinates maps
    const sectionTargets = {
        home: {
            camPos: new THREE.Vector3(0, 0, 4.8),
            lookAt: new THREE.Vector3(0, -0.3, 0),
            robotPos: new THREE.Vector3(1.5, -2.0, 0),
            robotRotY: 0
        },
        about: {
            camPos: new THREE.Vector3(-2.8, 0.4, 3.6),
            lookAt: new THREE.Vector3(1.2, -0.4, 0),
            robotPos: new THREE.Vector3(1.2, -1.8, -1.0),
            robotRotY: -0.5
        },
        skills: {
            camPos: new THREE.Vector3(2.8, 0.4, 3.6),
            lookAt: new THREE.Vector3(-1.2, -0.4, 0),
            robotPos: new THREE.Vector3(-1.2, -1.8, -1.0),
            robotRotY: 0.5
        },
        projects: {
            camPos: new THREE.Vector3(0, 2.8, 4.5),
            lookAt: new THREE.Vector3(0, 0.4, 0),
            robotPos: new THREE.Vector3(0, -1.4, -0.5),
            robotRotY: 0
        },
        services: {
            camPos: new THREE.Vector3(-1.8, -1.8, 4.2),
            lookAt: new THREE.Vector3(1.0, 0.5, 0),
            robotPos: new THREE.Vector3(1.0, -1.8, 0),
            robotRotY: -0.3
        },
        contact: {
            camPos: new THREE.Vector3(2.0, -1.6, 4.0),
            lookAt: new THREE.Vector3(-1.0, 0.5, 0),
            robotPos: new THREE.Vector3(-1.0, -1.8, 0),
            robotRotY: 0.3
        }
    };

    let activeSection = "home";
    let currentCameraPos = new THREE.Vector3(0, 0, 12); // Fly in on load
    let targetCameraPos = sectionTargets.home.camPos.clone();
    let currentLookAt = new THREE.Vector3(0, 0, 0);
    let targetLookAt = sectionTargets.home.lookAt.clone();

    // Listen to SPA transitions
    window.addEventListener("section-changed", (event) => {
        const section = event.detail;
        if (sectionTargets[section]) {
            activeSection = section;
            targetCameraPos.copy(sectionTargets[section].camPos);
            targetLookAt.copy(sectionTargets[section].lookAt);
            
            // Customize speech bubble greetings per section
            if (robot) {
                switch(section) {
                    case "about":
                        showBubble("Let me tell you about Ubaid! 📖", 2500);
                        break;
                    case "skills":
                        showBubble("Check out our technical stack! 💻", 2500);
                        break;
                    case "projects":
                        showBubble("Here are some neat things we built! 🔨", 2500);
                        break;
                    case "services":
                        showBubble("How can Ubaid help you? ⚙️", 2500);
                        break;
                    case "contact":
                        showBubble("Write us a message! 📬", 2500);
                        break;
                    default:
                        showBubble("Back home! 🤖", 2000);
                }
            }
        }
    });

    // Raycaster for full-screen mouse tracing
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    window.addEventListener("mousemove", (event) => {
        mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

        if (robot && !isSpinning) {
            // Track look-at targets
            targetRotationY = mouseVector.x * 0.8;
            targetRotationX = -mouseVector.y * 0.4;
        }

        // Spawn 3D cursor sparkles
        spawnSpark(mouseVector.x, mouseVector.y);
        spawnSpark(mouseVector.x, mouseVector.y);
    });

    // Touchscreen coordinate mapping helper
    function handleTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            mouseVector.x = (touch.clientX / window.innerWidth) * 2 - 1;
            mouseVector.y = -(touch.clientY / window.innerHeight) * 2 + 1;

            if (robot && !isSpinning) {
                targetRotationY = mouseVector.x * 0.8;
                targetRotationX = -mouseVector.y * 0.4;
            }

            // Spawn touch sparkles
            spawnSpark(mouseVector.x, mouseVector.y);
            spawnSpark(mouseVector.x, mouseVector.y);
        }
    }

    window.addEventListener("touchstart", (event) => {
        if (event.target.closest("a, button, input, textarea, label, .menu-btn")) return;
        handleTouchMove(event);
    }, { passive: true });

    window.addEventListener("touchmove", (event) => {
        // Only trigger sparkles if touching background area to keep panels scrollable
        if (event.target.closest("a, button, input, textarea, label, .menu-btn, .glass-card, footer")) return;
        handleTouchMove(event);
    }, { passive: true });

    window.addEventListener("click", (event) => {
        // Prevent clicks on layout elements (buttons, inputs, menu) from triggering actions
        if (event.target.closest("a, button, input, textarea, label, .menu-btn")) return;

        raycaster.setFromCamera(mouseVector, camera);
        if (robot) {
            const intersects = raycaster.intersectObjects(scene.children, true);
            let clickedRobot = false;
            
            for (let i = 0; i < intersects.length; i++) {
                let obj = intersects[i].object;
                while (obj) {
                    if (obj === robot) {
                        clickedRobot = true;
                        break;
                    }
                    obj = obj.parent;
                }
            }

            if (clickedRobot) {
                if (!isJumping) {
                    isJumping = true;
                    jumpVelocity = 0.18;
                }
                isSpinning = true;
                spinVelocity = 0.45;

                const clickMsgs = ["Wheee! 🌀", "To the moon! 🚀", "3D Spin! 💫", "Yoohoo! 🤖"];
                const randomMsg = clickMsgs[Math.floor(Math.random() * clickMsgs.length)];
                showBubble(randomMsg, 2000);
            }
        }
    });

    function animate() {
        requestAnimationFrame(animate);

        // 1. Smoothly translate camera
        currentCameraPos.lerp(targetCameraPos, 0.04);
        currentLookAt.lerp(targetLookAt, 0.04);
        camera.position.copy(currentCameraPos);
        camera.lookAt(currentLookAt);

        // 2. Rotate galaxy particles and circular cyber grid
        starfield.rotation.y += 0.001;
        gridHelper.rotation.y += 0.003;

        // 3. Rotate and float wireframe shapes (parallax objects)
        shapes.forEach((shape, index) => {
            shape.rotation.x += 0.004 * (index + 1);
            shape.rotation.y += 0.005 * (index + 1);
            shape.position.y += Math.sin(Date.now() * 0.0015 + index) * 0.0015;
        });

        // 4. Update cursor sparkles physics
        sparkPool.forEach(spark => {
            if (spark.life > 0) {
                spark.mesh.position.add(spark.velocity);
                spark.velocity.y -= 0.0003; // subtle gravity drop
                spark.life -= spark.decay;
                spark.mesh.material.opacity = spark.life;
                spark.mesh.rotation.x += 0.04;
                spark.mesh.rotation.y += 0.04;

                const s = spark.life;
                spark.mesh.scale.set(s, s, s);

                if (spark.life <= 0) {
                    spark.mesh.visible = false;
                }
            }
        });

        // 5. Render animations on loaded robot
        if (robot) {
            // Smoothly translate model coordinate targets based on active section
            const targetRobotPos = sectionTargets[activeSection].robotPos;
            robot.position.x = THREE.MathUtils.lerp(robot.position.x, targetRobotPos.x, 0.05);
            robot.position.z = THREE.MathUtils.lerp(robot.position.z, targetRobotPos.z, 0.05);

            // Scale interpolator
            currentScale = THREE.MathUtils.lerp(currentScale, scaleTarget, 0.1);
            robot.scale.set(currentScale, currentScale, currentScale);

            // Gravity jump physics
            if (isJumping) {
                jumpYOffset += jumpVelocity;
                jumpVelocity -= gravity;
                if (jumpYOffset <= 0) {
                    jumpYOffset = 0;
                    jumpVelocity = 0;
                    isJumping = false;
                }
            }

            // Normal bobbing float + jump height
            const floatOffset = Math.sin(Date.now() * 0.002) * 0.08;
            robot.position.y = THREE.MathUtils.lerp(robot.position.y, targetRobotPos.y + floatOffset + jumpYOffset, 0.1);

            // Orbiting specular PointLights follow the robot and rotate around its waist
            const lightTime = Date.now() * 0.0012;
            cyanLight.position.set(
                robot.position.x + Math.cos(lightTime) * 2.5,
                robot.position.y + 1.0 + Math.sin(lightTime * 0.8) * 1.5,
                robot.position.z + Math.sin(lightTime) * 2.5
            );
            magentaLight.position.set(
                robot.position.x + Math.sin(lightTime) * 2.5,
                robot.position.y + 1.0 + Math.cos(lightTime * 0.8) * 1.5,
                robot.position.z - Math.cos(lightTime) * 2.5
            );

            // Rotation interpolator
            const sectionBaseRotY = sectionTargets[activeSection].robotRotY;
            if (isSpinning) {
                robot.rotation.y += spinVelocity;
                spinVelocity *= 0.94;
                if (spinVelocity < 0.01) {
                    spinVelocity = 0;
                    isSpinning = false;
                }
                robot.rotation.x = THREE.MathUtils.lerp(robot.rotation.x, 0, 0.1);
            } else {
                // Combine section baseline orientation with pointer tracing
                const finalTargetRotY = sectionBaseRotY + targetRotationY;
                robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, finalTargetRotY, 0.08);
                robot.rotation.x = THREE.MathUtils.lerp(robot.rotation.x, targetRotationX, 0.08);
            }
        } else {
            // fallbacks if model not loaded
            const targetRobotPos = sectionTargets[activeSection].robotPos;
            const lightTime = Date.now() * 0.0012;
            cyanLight.position.set(
                targetRobotPos.x + Math.cos(lightTime) * 2.5,
                targetRobotPos.y + 1.0 + Math.sin(lightTime * 0.8) * 1.5,
                targetRobotPos.z + Math.sin(lightTime) * 2.5
            );
            magentaLight.position.set(
                targetRobotPos.x + Math.sin(lightTime) * 2.5,
                targetRobotPos.y + 1.0 + Math.cos(lightTime * 0.8) * 1.5,
                targetRobotPos.z - Math.cos(lightTime) * 2.5
            );
        }

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

// ---------------------------------------------------------------------
// 2. SMALL RENDERER FOR INLINE NAME HEADER COMPANION
// ---------------------------------------------------------------------
function initTextCompanion() {
    const container = document.getElementById("text-robot-container");
    if (!container) return;

    const width = 100;
    const height = 100;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 3.4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 3.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);

    let robot = null;
    let targetRotY = 0;

    loader.load("assets/models/robot.glb", (gltf) => {
        robot = gltf.scene;
        robot.scale.set(0.8, 0.8, 0.8);
        robot.position.set(0, -1.0, 0);
        scene.add(robot);
    });

    container.addEventListener("mousemove", (event) => {
        const rect = container.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        targetRotY = x * 0.6;
    });

    container.addEventListener("mouseleave", () => {
        targetRotY = 0;
    });

    let spinVelocity = 0;
    container.addEventListener("click", () => {
        spinVelocity = 0.3;
    });

    function animate() {
        requestAnimationFrame(animate);
        if (robot) {
            const floatOffset = Math.sin(Date.now() * 0.0035) * 0.05;
            robot.position.y = -1.0 + floatOffset;
            
            if (spinVelocity > 0) {
                robot.rotation.y += spinVelocity;
                spinVelocity *= 0.94;
            } else {
                robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, targetRotY, 0.1);
            }
        }
        renderer.render(scene, camera);
    }
    animate();
}

// Initialize setup when window loads
window.addEventListener("load", () => {
    init3DEngine();
    initTextCompanion();
});