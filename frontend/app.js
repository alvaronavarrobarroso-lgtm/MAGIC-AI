

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/* =====================================
   MAGIC AI - ROBOT 3D
===================================== */

function createMagicRobot() {
    const container = document.getElementById("robot3D");
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        32,
        (container.clientWidth || 400) / (container.clientHeight || 360),
        0.1,
        100
    );
    camera.position.set(0, 0.05, 9.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 400, container.clientHeight || 360);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Iluminación
    scene.add(new THREE.HemisphereLight(0xc9d7ff, 0x17102e, 2.1));

    const keyLight = new THREE.PointLight(0xffffff, 48, 30);
    keyLight.position.set(3, 5, 7);
    scene.add(keyLight);

    const violetLight = new THREE.PointLight(0x8d35ff, 42, 20);
    violetLight.position.set(-4, 1, 4);
    scene.add(violetLight);

    const blueLight = new THREE.PointLight(0x398cff, 30, 20);
    blueLight.position.set(4, -2, -3);
    scene.add(blueLight);

    const rimLight = new THREE.PointLight(0xc05aff, 34, 20);
    rimLight.position.set(0, 3, -4);
    scene.add(rimLight);

    // Materiales
    const shell = new THREE.MeshPhysicalMaterial({
        color: 0xe9efff,
        metalness: 0.48,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.16
    });

    const shellShadow = new THREE.MeshStandardMaterial({
        color: 0x8794b8,
        metalness: 0.78,
        roughness: 0.28
    });

    const dark = new THREE.MeshPhysicalMaterial({
        color: 0x090d20,
        metalness: 0.72,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.08
    });

    const jointMat = new THREE.MeshStandardMaterial({
        color: 0x252b48,
        metalness: 0.85,
        roughness: 0.24
    });

    const purple = new THREE.MeshStandardMaterial({
        color: 0x9b4dff,
        emissive: 0x7020ff,
        emissiveIntensity: 2.4,
        metalness: 0.35,
        roughness: 0.2
    });

    const cyan = new THREE.MeshStandardMaterial({
        color: 0x7beaff,
        emissive: 0x16bfff,
        emissiveIntensity: 2.2
    });

    const eyeMat = new THREE.MeshStandardMaterial({
        color: 0xe9baff,
        emissive: 0xb43dff,
        emissiveIntensity: 4.2
    });

    const robot = new THREE.Group();
    scene.add(robot);

    const body = new THREE.Group();
    robot.add(body);

    const head = new THREE.Group();
    body.add(head);

    function ball(parent, radius, material, position, scale = [1, 1, 1]) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 40, 32),
            material
        );
        mesh.position.set(...position);
        mesh.scale.set(...scale);
        parent.add(mesh);
        return mesh;
    }

    function rounded(parent, size, radius, material, position, scale = [1, 1, 1]) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(1, 40, 32),
            material
        );
        mesh.position.set(...position);
        mesh.scale.set(size[0] / 2, size[1] / 2, size[2] / 2);
        mesh.scale.multiply(new THREE.Vector3(...scale));
        parent.add(mesh);
        return mesh;
    }

    function tube(parent, radius, tubeRadius, material, position, arc = Math.PI * 2) {
        const mesh = new THREE.Mesh(
            new THREE.TorusGeometry(radius, tubeRadius, 16, 72, arc),
            material
        );
        mesh.position.set(...position);
        parent.add(mesh);
        return mesh;
    }

    function link(parent, a, b, radius, material) {
        const start = new THREE.Vector3(...a);
        const end = new THREE.Vector3(...b);
        const direction = new THREE.Vector3().subVectors(end, start);

        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.82, radius, direction.length(), 24),
            material
        );

        mesh.position.copy(start).add(end).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
        );
        parent.add(mesh);
        return mesh;
    }

    // Torso
    ball(body, 0.66, jointMat, [0, -1.55, 0], [1.1, 0.65, 0.72]);
    rounded(body, [1.72, 1.65, 1.0], 0.3, shell, [0, -0.92, 0.02]);
    ball(body, 0.22, shellShadow, [0, -1.78, 0.48], [1.8, 0.55, 0.6]);

    // Pecho luminoso
    ball(body, 0.37, dark, [0, -0.88, 0.57], [1, 1, 0.28]);
    tube(body, 0.31, 0.045, purple, [0, -0.88, 0.67]);
    ball(body, 0.19, purple, [0, -0.88, 0.66], [1, 1, 0.35]);
    ball(body, 0.075, cyan, [0, -0.88, 0.73], [1, 1, 0.4]);

    for (const side of [-1, 1]) {
        const detail = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, 0.48, 0.035),
            purple
        );
        detail.position.set(side * 0.61, -1.05, 0.51);
        detail.rotation.z = side * -0.12;
        body.add(detail);
        ball(body, 0.09, shellShadow, [side * 0.68, -0.35, 0.37], [1, 1, 0.5]);
    }

    // Cuello
    ball(body, 0.31, jointMat, [0, 0.02, 0], [1.1, 0.7, 0.9]);
    tube(body, 0.25, 0.035, cyan, [0, 0.02, 0.12]);

    // Cabeza
    ball(head, 1.0, shell, [0, 0.72, 0], [1.18, 0.94, 0.88]);
    ball(head, 0.79, dark, [0, 0.69, 0.62], [1.13, 0.66, 0.37]);

    // Borde del visor
    tube(head, 0.73, 0.055, shellShadow, [0, 0.69, 0.78]);
    tube(head, 0.69, 0.022, purple, [0, 0.69, 0.81]);

    // Ojos luminosos
    const leftEye = tube(head, 0.16, 0.045, eyeMat, [-0.34, 0.72, 0.94], Math.PI);
    leftEye.rotation.z = Math.PI;

    const rightEye = tube(head, 0.16, 0.045, eyeMat, [0.34, 0.72, 0.94], Math.PI);
    rightEye.rotation.z = Math.PI;

    // Boca
    const mouth = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.025, 0.025),
        cyan
    );
    mouth.position.set(0, 0.37, 0.95);
    mouth.scale.x = 0.65;
    head.add(mouth);

    // Auriculares laterales
    for (const side of [-1, 1]) {
        ball(head, 0.36, jointMat, [side * 1.08, 0.7, 0], [0.48, 1.05, 0.9]);
        ball(head, 0.27, shell, [side * 1.13, 0.7, 0.08], [0.42, 1.05, 0.9]);
        tube(head, 0.19, 0.045, purple, [side * 1.25, 0.7, 0.1]);
        ball(head, 0.105, cyan, [side * 1.29, 0.7, 0.12], [0.45, 1, 1]);
        ball(head, 0.09, shellShadow, [side * 0.78, 1.42, 0.1], [1.2, 0.25, 0.5]);
    }

    // Antena
    link(head, [0, 1.55, 0], [0, 1.78, 0], 0.055, shellShadow);
    ball(head, 0.105, purple, [0, 1.82, 0]);
    ball(head, 0.045, cyan, [0, 1.84, 0.055]);

    // Brazos articulados
    function makeArm(side) {
        const pivot = new THREE.Group();
        pivot.position.set(side * 0.91, -0.35, 0);
        body.add(pivot);

        ball(pivot, 0.31, jointMat, [0, 0, 0], [1, 1, 0.9]);
        ball(pivot, 0.28, shell, [side * 0.05, -0.03, 0.12], [1, 1, 0.82]);
        tube(pivot, 0.23, 0.035, purple, [0, 0, 0.2]);

        link(pivot, [0, -0.12, 0], [side * 0.12, -0.66, 0.02], 0.19, shell);
        ball(pivot, 0.22, jointMat, [side * 0.12, -0.67, 0.02]);
        tube(pivot, 0.16, 0.035, cyan, [side * 0.12, -0.67, 0.12]);

        link(pivot, [side * 0.12, -0.68, 0.02], [side * 0.2, -1.08, 0.16], 0.15, shell);
        ball(pivot, 0.19, shell, [side * 0.2, -1.08, 0.16], [0.9, 1, 0.85]);

        // Dedos
        for (let i = 0; i < 4; i++) {
            const fx = side * 0.2 + (i - 1.5) * 0.075;
            link(pivot, [fx, -1.13, 0.25], [fx, -1.29, 0.29], 0.035, shellShadow);
            ball(pivot, 0.038, purple, [fx, -1.3, 0.3]);
        }

        link(pivot, [side * 0.07, -1.08, 0.2], [side * 0.02, -1.22, 0.32], 0.045, shell);

        return pivot;
    }

    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);

    // Piernas
    ball(body, 0.48, shell, [0, -1.92, 0], [1.05, 0.5, 0.72]);

    for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.36, -2.05, 0);
        body.add(leg);

        link(leg, [0, 0, 0], [side * 0.08, -0.42, 0.02], 0.13, shell);
        ball(leg, 0.17, jointMat, [side * 0.08, -0.42, 0.02]);
        ball(leg, 0.23, shell, [side * 0.1, -0.57, 0.13], [0.8, 0.55, 1]);
        tube(leg, 0.12, 0.025, purple, [side * 0.1, -0.57, 0.23]);
    }

    // Aros de energía
    const hoverRing = tube(robot, 1.18, 0.018, purple, [0, -2.35, -0.05]);
    hoverRing.rotation.x = Math.PI / 2.25;

    const hoverRing2 = tube(robot, 1.38, 0.012, cyan, [0, -2.37, -0.08]);
    hoverRing2.rotation.x = Math.PI / 2.1;
    hoverRing2.rotation.z = 0.35;

    robot.position.y = 0.12;
    robot.scale.setScalar(0.88);

    // Movimiento del ratón
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener("pointermove", (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 2;
        targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        currentX += (targetX - currentX) * 0.055;
        currentY += (targetY - currentY) * 0.055;

        head.rotation.y = currentX * 0.48;
        head.rotation.x = currentY * 0.24;
        body.rotation.y = currentX * 0.12;
        body.rotation.z = -currentX * 0.075;
        body.rotation.x = currentY * 0.055;

        leftArm.rotation.z = -0.08 + Math.sin(time * 1.15) * 0.045;
        rightArm.rotation.z = 0.08 - Math.sin(time * 1.15) * 0.045;

        robot.position.y = 0.12 + Math.sin(time * 1.35) * 0.065;
        robot.rotation.y = Math.sin(time * 0.55) * 0.035;

        hoverRing.rotation.z += 0.0025;
        hoverRing2.rotation.z -= 0.0018;

        renderer.render(scene, camera);
    }

    animate();

    const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    resizeObserver.observe(container);
}

/* =====================================
   CHAT MAGIC AI
===================================== */

const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const chat = document.getElementById("chat");
const send = document.getElementById("send");
const welcome = document.getElementById("welcome");

const menu = document.getElementById("sideMenu");
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const backdrop = document.getElementById("menuBackdrop");
const sideNewChat = document.getElementById("sideNewChat");
const newChat = document.getElementById("newChat");
const historyList = document.getElementById("historyList");
const themeOption = document.getElementById("themeOption");
const notice = document.getElementById("notice");

let conversationHistory = [];
let conversations = [];

try {
    conversations = JSON.parse(
        localStorage.getItem("magicChats") || "[]"
    );

    if (!Array.isArray(conversations)) {
        conversations = [];
    }
} catch {
    conversations = [];
}

let currentChatId = null;
let noticeTimer;

/* MENU LATERAL */

function openMenu() {
    menu.classList.add("open");
    backdrop.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
}

function closeMenu() {
    menu.classList.remove("open");
    backdrop.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
}

menuToggle.addEventListener("click", openMenu);
menuClose.addEventListener("click", closeMenu);
backdrop.addEventListener("click", closeMenu);

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
});

/* AVISOS */

function showNotice(message) {
    notice.textContent = message;
    notice.classList.add("show");

    clearTimeout(noticeTimer);

    noticeTimer = setTimeout(() => {
        notice.classList.remove("show");
    }, 2500);
}

/* HISTORIAL */

function saveConversations() {
    localStorage.setItem("magicChats", JSON.stringify(conversations));
}

function renderHistoryList() {
    historyList.innerHTML = "";

    if (conversations.length === 0) {
        const empty = document.createElement("p");
        empty.className = "history-empty";
        empty.textContent = "Tus conversaciones aparecerán aquí.";
        historyList.appendChild(empty);
        return;
    }

    conversations.slice().reverse().forEach((conversation) => {
        const button = document.createElement("button");

        button.className = "history-entry";
        button.textContent = conversation.title || "Conversación";

        button.addEventListener("click", () => {
            conversationHistory = [...conversation.messages];
            currentChatId = conversation.id;

            chat.innerHTML = "";
            welcome.style.display = "none";

            conversationHistory.forEach((item) => {
                addMessage(item.content, item.role);
            });

            closeMenu();
        });

        historyList.appendChild(button);
    });
}

function saveCurrentConversation() {
    if (conversationHistory.length === 0) return;

    const firstMessage = conversationHistory.find(
        item => item.role === "user"
    );

    const title = firstMessage
        ? firstMessage.content.slice(0, 38)
        : "Nueva conversación";

    const conversation = {
        id: currentChatId || Date.now(),
        title: title,
        messages: [...conversationHistory]
    };

    const existing = conversations.findIndex(
        item => item.id === conversation.id
    );

    if (existing >= 0) {
        conversations[existing] = conversation;
    } else {
        conversations.push(conversation);
    }

    currentChatId = conversation.id;
    conversations = conversations.slice(-30);

    saveConversations();
    renderHistoryList();
}

/* MENSAJES */

function addMessage(text, role) {
    const div = document.createElement("div");

    div.className = "message " + role;
    div.textContent = text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    return div;
}

/* NUEVO CHAT */

function startNewChat() {
    saveCurrentConversation();

    conversationHistory = [];
    currentChatId = null;

    chat.innerHTML = "";
    chat.appendChild(welcome);

    welcome.style.display = "flex";

    closeMenu();
    input.focus();
}

newChat.addEventListener("click", startNewChat);
sideNewChat.addEventListener("click", startNewChat);

/* CONEXION CON GEMINI */

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message || send.disabled) return;

    welcome.style.display = "none";

    addMessage(message, "user");

    input.value = "";
    send.disabled = true;

    const loading = addMessage(
        "MAGIC está pensando...",
        "assistant"
    );

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory
            })
        });

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error("El servidor no devolvió una respuesta válida.");
        }

        if (!response.ok) {
            throw new Error(data.detail || "Error de conexión con MAGIC.");
        }

        loading.remove();

        addMessage(data.reply, "assistant");

        conversationHistory.push(
            { role: "user", content: message },
            { role: "assistant", content: data.reply }
        );

        saveCurrentConversation();

    } catch (error) {
        loading.textContent = "Error: " + error.message;
    }

    send.disabled = false;
    input.focus();
});

/* SUGERENCIAS */

document.querySelectorAll(".suggestion").forEach((button) => {
    button.addEventListener("click", () => {
        input.value = button.dataset.prompt;
        form.requestSubmit();
    });
});

/* CAMBIAR APARIENCIA */

themeOption.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight = document.body.classList.contains("light-mode");

    localStorage.setItem(
        "magicTheme",
        isLight ? "light" : "dark"
    );

    showNotice(
        isLight
            ? "Apariencia clara activada"
            : "Apariencia oscura activada"
    );
});

if (localStorage.getItem("magicTheme") === "light") {
    document.body.classList.add("light-mode");
}

/* INICIAR */

renderHistoryList();
createMagicRobot();
