import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Howl } from 'howler';
import gsap from 'gsap';

//Scene
const canvas = document.querySelector('#experience-canvas');
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  1000
);

// --- Camera Setup ---
const defaultCameraPos = new THREE.Vector3();
if (window.innerWidth > 1000) {
  defaultCameraPos.set(-13, 7.2, -2);
} else {
  defaultCameraPos.set(-30, 10, -2);
}
const defaultTarget = new THREE.Vector3(8, 3, -1);
camera.position.copy(defaultCameraPos);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.copy(defaultTarget);
controls.maxPolarAngle = Math.PI / 1.9;
controls.maxDistance = 30;
controls.minDistance = 5;
controls.enablePan = false;
controls.update();

//Sections
const models = {
  about: document.querySelector('.about'),
  skills: document.querySelector('.skills'),
  work: document.querySelector('.projects'),
  contact: document.querySelector('.contact'),
}

let currentHovered = null;

// --- AUDIO SYSTEM (FIXED & OPTIMIZED) ---
let isMuted = true; 
let musicHasStarted = false;

// 1. Enter Button SFX (Excluded from Mute Logic)
const floop = new Howl({ src: ["/audio/sfx/floop.mp3"], volume: 1 });

// 2. Interactive SFX (Custom muted/unmuted volumes)
const bloop = new Howl({ src: ["/audio/sfx/bubble.ogg"] });
const clouk = new Howl({ src: ["/audio/sfx/clouk.mp3"] });
const electro = new Howl({ src: ["/audio/sfx/electro.mp3"] });

// Store SFX with their custom volumes for muted/unmuted
const sfxList = [
  { sound: bloop, volumes: { muted: 0.02, unmuted: 0.7 } },
  { sound: clouk, volumes: { muted: 0.1, unmuted: 1 } },
  { sound: electro, volumes: { muted: 0.01, unmuted: 0.2 } }
];

// Update all SFX volumes according to mute state
function updateSFXVolume() {
  sfxList.forEach(item => {
    const vol = isMuted ? item.volumes.muted : item.volumes.unmuted;
    item.sound.volume(vol);
  });
}

// Initial setup
updateSFXVolume();

// --- MUSIC LOGIC (PRE-LOADING) ---
let songIndex = 0;
const songPaths = [
  "/audio/song/REPO.mp3",
  "/audio/song/Bob.mp3"
];

// We will store actual Howl instances here once loaded
let musicInstances = []; 

function loadMusicAssets() {
  // Load ALL songs immediately when entering the site
  songPaths.forEach((path) => {
    const sound = new Howl({
      src: [path],
      loop: true,
      volume: 0.5,
      preload: true, // Force preload
      mute: isMuted // Start with current mute state
    });
    musicInstances.push(sound);
  });
}

function nextSong() {
  // Stop current
  if (musicInstances[songIndex]) {
    musicInstances[songIndex].stop();
  }

  // Increment index
  songIndex = (songIndex + 1) % musicInstances.length;

  // Play next (only if we have already started music interaction)
  if (musicHasStarted) {
    const nextMusic = musicInstances[songIndex];
    nextMusic.mute(isMuted); // Ensure it respects current mute
    nextMusic.play();
  }
}

function isModelOpen(model) {
  return window.getComputedStyle(model).display !== 'none';
}

function showExclusiveModel(model) {
  const all = [models.about, models.skills, models.work, models.contact];
  all.forEach(m => {
    if (m && m !== model && isModelOpen(m))
      if (clickabou) hideModel(m);
  });
  if (model && !isModelOpen(model))
    if (clickabou) showModel(model);
}

function resetCamera() {
  gsap.to(camera.position, {
    x: defaultCameraPos.x,
    y: defaultCameraPos.y,
    z: defaultCameraPos.z,
    duration: 1.5,
    ease: "power2.inOut"
  });

  gsap.to(controls.target, {
    x: defaultTarget.x,
    y: defaultTarget.y,
    z: defaultTarget.z,
    duration: 1.5,
    ease: "power2.inOut",
    onUpdate: () => controls.update()
  });
}

function playHoverAnimation(object, ok, scale = 1.3, rotation = Math.PI / 32, position = 0, ease = "bounce.out(1.8)", duration = 0.5) {
  gsap.killTweensOf(object.scale);
  gsap.killTweensOf(object.rotation);
  gsap.killTweensOf(object.position);

  if (ok) {
    object.userData.isAnimating = true;
    gsap.to(object.scale, {
      x: object.userData.initialScale.x * scale,
      y: object.userData.initialScale.y * scale,
      z: object.userData.initialScale.z * scale,
      duration: duration,
      ease: ease,
    });
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x + rotation,
      duration: duration,
      ease: ease,
      onComplete: () => { object.userData.isAnimating = false; }
    });
    gsap.to(object.position, {
      y: object.userData.initialPosition.y + position,
      duration: duration,
      ease: ease,
    });
  } else {
    gsap.to(object.scale, {
      x: object.userData.initialScale.x,
      y: object.userData.initialScale.y,
      z: object.userData.initialScale.z,
      duration: 0.3,
      ease: ease,
    });
    gsap.to(object.position, {
      y: object.userData.initialPosition.y,
      duration: 0.3,
      ease: ease,
    });
    gsap.to(object.rotation, {
      x: object.userData.initialRotation.x,
      duration: 0.3,
      ease: ease,
      onComplete: () => { object.userData.isAnimating = false; }
    });
    if (object.name.includes("Boombox")) {
      BoomboxHoverEnd(object);
    }
  }
}

const exits = document.querySelectorAll('.model-exit')
exits.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const model = e.target.closest('.model');
    hideModel(model);
    clickabou = true;
    bloop.play();
    btn.classList.add("pressed");
    setTimeout(() => { btn.classList.remove("pressed"); }, 200);
  });
});

const showModel = (model) => {
  model.style.display = 'block';
  gsap.set(model, { opacity: 0 });
  gsap.to(model, { opacity: 1, duration: 0.5 });
}

const hideModel = (model) => {
  gsap.to(model, {
    opacity: 0,
    duration: 0.2,
    onComplete: () => { model.style.display = 'none'; }
  });
}






// --- MUTE & LANGUAGE LOGIC (Unified Fix) ---
const muteButton = document.querySelector(".mute-toggle-button");
const soundOff = document.querySelector(".sound-off-svg");
const soundOn = document.querySelector(".sound-on-svg");
const ln = document.querySelector(".language-toggle-button");

// Set initial UI state
soundOff.style.display = "block";
soundOn.style.display = "none";

// --- HELPER: Handle Click vs Touch ---
// This prevents the "Sticky Hover" on mobile but allows clicking on laptop
function addSmartListener(element, callback) {
  element.addEventListener("touchstart", (e) => {
    if (e.cancelable) e.preventDefault(); // Stop mobile ghost clicks
    callback(e);
  }, { passive: false });

  element.addEventListener("click", (e) => {
    callback(e);
  });
}


// --- MUTE FUNCTION ---
const toggleMute = (e) => {
  bloop.play();

  // Logic
  isMuted = !isMuted;
  updateSFXVolume();

  const currentMusic = musicInstances[songIndex];
  if (!musicHasStarted) {
    if (!isMuted && currentMusic) {
      currentMusic.mute(false);
      currentMusic.play();
      musicHasStarted = true;
    }
  } else {
    if (currentMusic) currentMusic.mute(isMuted);
  }

  // Animation
  muteButton.classList.add("pressed");
  muteButton.blur(); // Removes focus ring
  setTimeout(() => { muteButton.classList.remove("pressed"); }, 200);

  // Icon Swap
  soundOff.style.display = isMuted ? "block" : "none";
  soundOn.style.display = isMuted ? "none" : "block";
};

// --- LANGUAGE LOGIC (Now inside main.js!) ---
let currentLanguage = 'en';

const updateLanguageText = () => {
  // Select all elements that need translating
  document.querySelectorAll('[data-en]').forEach(element => {
    if (element.hasAttribute('data-en-placeholder')) {
      // Handle inputs/textareas
      element.placeholder = currentLanguage === 'en' 
        ? element.getAttribute('data-en-placeholder') 
        : element.getAttribute('data-fr-placeholder');
    } else {
      // Handle normal text
      element.textContent = currentLanguage === 'en' 
        ? element.getAttribute('data-en') 
        : element.getAttribute('data-fr');
    }
  });

  // Update the button text itself
  if(ln) ln.textContent = currentLanguage.toUpperCase();
};

const toggleLanguageAnim = (e) => {
  bloop.play();
  
  // Animation
  ln.classList.add("pressed");
  ln.blur(); 
  setTimeout(() => { ln.classList.remove("pressed"); }, 200);

  // Logic: Switch Language
  currentLanguage = currentLanguage === 'en' ? 'fr' : 'en';
  updateLanguageText();
};

// Apply Listeners
if(muteButton) addSmartListener(muteButton, toggleMute);
if(ln) addSmartListener(ln, toggleLanguageAnim);









// --- LOADING SCREEN ---
let sceneReady = false;
let enterLocked = false;

const progressFill = document.getElementById("progress-fill");
const enterBtn = document.getElementById("enter-btn");
const loadingScreen = document.getElementById("loading-screen");
const loadingPercentage = document.getElementById("loading-percentage");

const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  if(progressFill) progressFill.style.width = `${progress}%`;
  if (loadingPercentage) loadingPercentage.textContent = `${Math.floor(progress)}%`;
};

loadingManager.onLoad = function () {
  if(progressFill) progressFill.style.width = `100%`;
  if (loadingPercentage) loadingPercentage.textContent = `100%`;
  
  setTimeout(() => {
    sceneReady = true;
    if(enterBtn) {
      enterBtn.textContent = "ENTER";
      enterBtn.classList.add("ready");
    }
  }, 200);
};

if(enterBtn) {
  enterBtn.addEventListener("click", () => {
    if (!sceneReady) return; 
    if (enterLocked) return;
    enterLocked = true;

    // This plays at 100% volume always now
    floop.play();

    if(loadingScreen) loadingScreen.classList.add("hidden");
    
    // --- LOAD HEAVY ASSETS (Music & Video) ---
    loadHeavyAssets(); 

    setTimeout(() => {
      if(loadingScreen) loadingScreen.style.display = "none";
      IntroAnimation();
    }, 1000);
  });
}


//Loaders & Textures
const textureLoader = new THREE.TextureLoader()
const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath('/draco/');
const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoloader)

const skybox = new THREE.CubeTextureLoader()
  .setPath('textures/skybox/')
  .load(['px.webp', 'nx.webp', 'py.webp', 'ny.webp', 'pz.webp', 'nz.webp',]);
scene.background = skybox;
skybox.rotationY = 45;

const Textures = {
  1: { day: "textures/world/1_Nairs.webp", night: "textures/world/1_Nairs.webp" },
  2: { day: "textures/world/2_Figurines.webp", night: "textures/world/2_Figurines.webp" },
  3: { day: "textures/world/3_Plushies.webp", night: "textures/world/3_Plushies.webp" },
  4: { day: "textures/world/4_Toolbox.webp", night: "textures/world/4_Toolbox.webp" },
  5: { day: "textures/world/5_Rog.webp", night: "textures/world/5_Rog.webp" },
  6: { day: "textures/world/6_Table.webp", night: "textures/world/6_Table.webp" },
  7: { day: "textures/world/7_Katana.webp", night: "textures/world/7_Katana.webp" },
  8: { day: "textures/world/8_Treasure.webp", night: "textures/world/8_Treasure.webp" },
  9: { day: "textures/world/9_Desk.webp", night: "textures/world/9_Desk.webp" },
  10: { day: "textures/world/10_Signs.webp", night: "textures/world/10_Signs.webp" },
  11: { day: "textures/world/11_Escanor.webp", night: "textures/world/11_Escanor.webp" },
  12: { day: "textures/world/12_Tree.webp", night: "textures/world/12_Tree.webp" },
  13: { day: "textures/world/13_Boombox.webp", night: "textures/world/13_Boombox.webp" },
}

const loadedTexture = { day: {}, night: {} }
Object.entries(Textures).forEach(([key, path]) => {
  const dayTexture = textureLoader.load(path.day);
  const nightTexture = textureLoader.load(path.night);
  loadedTexture.day[key] = dayTexture;
  loadedTexture.night[key] = nightTexture;
  dayTexture.flipY = false;
  nightTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
});

// --- VIDEO & SCREEN LOGIC ---
let screenMesh = null; // Store reference to mesh
let ScreenVideo = null; // HTML Video Element
let screenTexture = null; // THREE Texture

function loadHeavyAssets() {
  // 1. Load Music
  loadMusicAssets();

  // 2. Load Video
  ScreenVideo = document.createElement("video");
  ScreenVideo.src = "textures/Acheron2.mp4";
  ScreenVideo.muted = true;
  ScreenVideo.loop = true;
  ScreenVideo.autoplay = true;
  ScreenVideo.play().then(() => {
    // When video actually starts playing
    screenTexture = new THREE.VideoTexture(ScreenVideo);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.flipY = false;

    if(screenMesh) {
      screenMesh.material.map = screenTexture;
      screenMesh.material.needsUpdate = true;

      // ANIMATE "SCREEN ON" EFFECT
      gsap.to(screenMesh.material.color, {
        r: 1, g: 1, b: 1,
        duration: 2,
        ease: "power2.inOut"
      });
    }
  }).catch(e => console.log("Video autoplay blocked or failed", e));
}


// --- INTERACTION SYSTEM ---
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const raycasterObjects = [];
let clickabou = true;
let currentIntersects = [];
let lastTouchTime = 0;
let touchMoved = false;

window.addEventListener("mousemove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("touchstart", (event) => {
  touchMoved = false;
  pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
}, { passive: false });

window.addEventListener("touchmove", (event) => {
  touchMoved = true;
  pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
}, { passive: false });

window.addEventListener("touchend", (event) => {
  const currentTime = new Date().getTime();
  if (touchMoved) { 
    lastTouchTime = currentTime;
    return;
  }
  
  if(event.target !== canvas) {
    return;
  }

  event.preventDefault(); 
  
  if (event.changedTouches.length > 0) {
      pointer.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
      pointer.y = - (event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
  }

  handleRaycaster(); 
}, { passive: false });

// Desktop Click
window.addEventListener('click', (event) => {
  if (('ontouchstart' in window) || event.target !== canvas) return;
  handleRaycaster();
});

function handleRaycaster() {
  raycaster.setFromCamera(pointer, camera);
  const clickIntersects = raycaster.intersectObjects(raycasterObjects);

  if (clickIntersects.length > 0) {
    const object = clickIntersects[0].object;

    if (clickabou) {
      Object.entries(social).forEach(([name, url]) => {
        if (object.name.includes(name)) {
          window.open(url, "_blank");
          return;
        }
      });
    }

    if (object.name.includes("About") && clickabou) {
      showExclusiveModel(models.about);
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Skills") && clickabou) {
      showExclusiveModel(models.skills);
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Projects") && clickabou) {
      showExclusiveModel(models.work);
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Contact") && clickabou) {
      showExclusiveModel(models.contact);
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Home")) {
      clickabou = true;
      clouk.play();
      Object.values(models).forEach(model => {
        if (model && isModelOpen(model)) hideModel(model);
      });
      resetCamera();
    }

    if (object.name.includes("Boombox") && clickabou) {
      nextSong();
      electro.play();
    }

    setTimeout(() => {
      if (currentHovered) {
        playHoverAnimation(currentHovered, false);
        currentHovered = null;
        document.body.style.cursor = 'default';
      }
    }, 300);
  }
}

let chest, boombox;
const social = {
  "GitHub": "https://github.com/Nairwins",
  "Youtube": "https://www.youtube.com/@nairwin2716",
  "Discord": "https://discord.com/users/nairwin",
}

function BoomboxAnimation(boombox) {
  boombox.scale.set(boombox.userData.initialScale.x, boombox.userData.initialScale.y, boombox.userData.initialScale.z);
  const tb = gsap.timeline({ repeat: -1, yoyo: true });
  tb.to(boombox.scale, {
    x: boombox.userData.initialScale.x * 0.9,
    y: boombox.userData.initialScale.y * 1.2,
    z: boombox.userData.initialScale.z * 1.0,
    duration: 1,
    ease: "power1.inOut",
  });
  boombox.userData.boomboxAnim = tb;
}

function BoomboxHoverEnd(boombox) {
  if (boombox.userData.boomboxAnim) {
    boombox.userData.boomboxAnim.kill();
    boombox.userData.boomboxAnim = null;
  }
  gsap.to(boombox.scale, {
    x: boombox.userData.initialScale.x,
    y: boombox.userData.initialScale.y,
    z: boombox.userData.initialScale.z,
    duration: 0.3,
    ease: "bounce.out(1.8)",
    onComplete: () => { BoomboxAnimation(boombox); }
  });
}

const ropes = [];
const pointers = [];
const figurines = [];
const plants = [];
const dragons = [];

loader.load('models/Firestar.glb', (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      if (child.name.includes("Screen")) {
        // Init with BLACK color and NO texture for now
        screenMesh = child;
        child.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
      }
      if (child.name.includes("Target") || child.name.includes("Hover") || child.name.includes("Pointer")) {
        child.userData.initialScale = new THREE.Vector3().copy(child.scale);
        child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
        child.userData.initialPosition = new THREE.Vector3().copy(child.position);
        child.userData.isAnimating = false;
      }
      if (child.name.includes("ChestTop")) {
        chest = child;
        const ta = gsap.timeline({ repeat: -1, yoyo: true });
        ta.to(chest.rotation, { onUpdate: () => chest.rotateX(-0.0012), duration: 2, ease: "power4.inOut" });
        ta.to(chest.rotation, { onUpdate: () => chest.rotateX(0.0012), duration: 2, ease: "power4.inOut" });
      }
      if (child.name.includes("Boombox")) {
        boombox = child;
        BoomboxAnimation(boombox);
      }
      if (child.name.includes("Hang")) { ropes.push(child); child.scale.set(0, 0, 0); }
      if (child.name.includes("Pannel")) { pointers.push(child); child.scale.set(0, 0, 0); }
      if (child.name.includes("Figurine")) { figurines.push(child); child.scale.set(0, 0, 0); }
      if (child.name.includes("Plant")) { plants.push(child); child.scale.set(0, 0, 0); }
      if (child.name.includes("Dragonball")) { dragons.push(child); child.scale.set(0, 0, 0); }

      Object.keys(Textures).forEach((key) => {
        if (child.name.includes(key)) {
          const material = new THREE.MeshBasicMaterial({ map: loadedTexture.day[key] });
          child.material = material;
          raycasterObjects.push(child);
          if (child.material.map) child.material.map.minFilter = THREE.LinearFilter;
        }
      });
    }
  });
  scene.add(glb.scene);
});

function IntroAnimation() {
  const order = ["Home", "About", "Skills", "Projects", "Contact"];
  const getIndex = name => {
    for (let i = 0; i < order.length; i++) {
      if (name.includes(order[i])) return i;
    }
    return order.length;
  };

  ropes.sort((a, b) => getIndex(a.name) - getIndex(b.name));
  pointers.sort((a, b) => getIndex(a.name) - getIndex(b.name));

  const t1a = gsap.timeline({ duration: 0.5, ease: "back.out(1.7)" });
  const t1b = gsap.timeline({ duration: 0.5, ease: "back.out(1.7)", delay: 0.35 });
  const t2 = gsap.timeline({ duration: 0.5, ease: "back.out(1.7)" });
  const t3 = gsap.timeline({ duration: 0.5, ease: "back.out(1.7)" });

  ropes.forEach((rope) => t1a.to(rope.scale, { x: 1, y: 1, z: 1 }, "-=0.1"));
  pointers.forEach((pannel) => t1b.to(pannel.scale, { x: 1, y: 1, z: 1 }, "-=0.1"));
  figurines.forEach((figurine) => t2.to(figurine.scale, { x: 1, y: 1, z: 1 }, "-=0.2"));
  dragons.forEach((dragon) => t2.to(dragon.scale, { x: 1, y: 1, z: 1 }, "-=0.3"));
  plants.forEach((plant) => t3.to(plant.scale, { x: 1, y: 1, z: 1 }, "-=0.3"));
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if (window.innerWidth > 1000) defaultCameraPos.set(-13, 7.2, -2);
  else defaultCameraPos.set(-30, 10, -2);
})

const render = () => {
  controls.update();

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(raycasterObjects);
  currentIntersects = intersects; 

  if (intersects.length > 0) {
    const intersected = intersects[0].object;
    if (
      intersected.name.includes("Target") ||
      intersected.name.includes("Hover") ||
      intersected.name.includes("Pointer") ||
      intersected.name.includes("Pannel")
    ) {
      if (intersected !== currentHovered) {
        if (currentHovered) playHoverAnimation(currentHovered, false);
        if (intersected.name.includes("Pannel")) playHoverAnimation(intersected, true);
        else if (intersected.name.includes("Pointer")) playHoverAnimation(intersected, true, 1.3, 0, 0);
        else if (intersected.name.includes("Hover")) playHoverAnimation(intersected, true, 1.3, 0, 0, "power3.out", 0.5);
        else if (intersected.name.includes("Target")) playHoverAnimation(intersected, true, 1.1, 0, 0.1, "power3.out", 0.5);
        currentHovered = intersected;
      }
      if ((intersected.name.includes("Pannel") && clickabou) || intersected.name.includes("Home") || (intersected.name.includes("Pointer") && clickabou))
        document.body.style.cursor = 'pointer';
      else
        document.body.style.cursor = 'default';
    } else {
      if (currentHovered) {
        playHoverAnimation(currentHovered, false);
        currentHovered = null;
      }
      document.body.style.cursor = 'default';
    }
  } else {
    if (currentHovered) {
      playHoverAnimation(currentHovered, false);
      currentHovered = null;
    }
    document.body.style.cursor = 'default';
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(render);
};
render();