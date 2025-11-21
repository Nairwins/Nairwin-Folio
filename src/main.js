// hdri lighting
// Logo on tree and plants
// Penguin face uvs


import './style.scss';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import {Howl} from 'howler';
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

//Camera Position Start
if (window.innerWidth > 1000) {
  camera.position.set(-13 , 7.2 , -2);
}
else {
  camera.position.set(-30, 10 , -2);
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));



// Controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

controls.enableDamping = true
controls.dampingFactor = 0.05
controls.update()
controls.target.set(8 , 3 , -1);



controls.maxPolarAngle = Math.PI /1.9;
controls.maxDistance = 30;
controls.minDistance = 5;
controls.enablePan = false;





//Sections
const models = {
  about: document.querySelector('.about'),
  skills: document.querySelector('.skills'),
  work: document.querySelector('.projects'),
  contact: document.querySelector('.contact'),
}

let currentHovered = null;

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


function playHoverAnimation (object, ok, scale=1.3, rotation=Math.PI / 32, position=0, ease="bounce.out(1.8)", duration=0.5) {
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
      onComplete: () => {
        object.userData.isAnimating = false;
      }
    });

    gsap.to(object.position, {
      y: object.userData.initialPosition.y + position,
      duration: duration,
      ease: ease,
    });

  } else {
    // return to stored initial values
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
      onComplete: () => {
        object.userData.isAnimating = false;
      }
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

    exits.classList.add("pressed");
    setTimeout(() => {
      exits.classList.remove("pressed");
    }, 200);
  });
  
  // Just prevent default on touch to avoid double fire
  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    clickabou = true;
  }, { passive: false });
});



const showModel = (model) => {
  model.style.display = 'block';

  gsap.set(model, {opacity: 0});

  gsap.to(model, {
    opacity: 1,
    duration: 0.5});
}

const hideModel = (model) => {
  gsap.to(model, {
    opacity: 0,
    duration: 0.2,
    onComplete: () => {
      model.style.display = 'none';
    }
  }); 
}




//Audio
  //Music
let songIndex = 0;
const songs = [
  "/audio/song/REPO.mp3",
  "/audio/song/Bob.mp3"
];

let Music = new Howl({
  src: [songs[songIndex]],
  loop: true,
  volume: 0.5,
});

function nextSong() {
  songIndex = (songIndex + 1) % songs.length;
  Music.stop();
  Music = new Howl({
    src: [songs[songIndex]],
    loop: true,
    volume: 0.5,
  });
  Music.play();
}

  //SFX
const floop = new Howl({
  src: ["/audio/sfx/floop.mp3"],
  volume: 1, 
});


const bloop = new Howl({
  src: ["/audio/sfx/bubble.ogg"],
  volume: 0.7, 
});

const clouk = new Howl({
  src: ["/audio/sfx/clouk.mp3"],
  volume: 1.5, 
});

const electro = new Howl({
  src: ["/audio/sfx/electro.mp3"],
  volume: 0.2, 
});



  //Mute
const muteButton = document.querySelector(".mute-toggle-button");
const soundOff = document.querySelector(".sound-off-svg");
const soundOn = document.querySelector(".sound-on-svg");

const ln = document.querySelector(".language-toggle-button");

let isMuted = false;

muteButton.addEventListener("click", () => {
  bloop.play();
  isMuted = !isMuted;
  
  Music.mute(isMuted);

  muteButton.classList.add("pressed");
  setTimeout(() => {
    muteButton.classList.remove("pressed");
  }, 200);


  // Toggle which SVG is visible
  if (isMuted) {
    soundOff.style.display = "block";
    soundOn.style.display = "none";
  } else {
    soundOff.style.display = "none";
    soundOn.style.display = "block";
  }
});


ln.addEventListener("click", () => {
  bloop.play();

  ln.classList.add("pressed");
  setTimeout(() => {
    ln.classList.remove("pressed");
  }, 200);
});


//Loading Screen
let sceneReady = false;

const progressFill = document.getElementById("progress-fill");
const enterBtn = document.getElementById("enter-btn");
const loadingScreen = document.getElementById("loading-screen");
const loadingPercentage = document.getElementById("loading-percentage"); // Add this line

const loadingManager = new THREE.LoadingManager();
let enterLocked = false;

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  progressFill.style.width = `${progress}%`;
  if (loadingPercentage) { // Add null check
    loadingPercentage.textContent = `${Math.floor(progress)}%`;
  }
};

loadingManager.onLoad = function () {
  progressFill.style.width = `100%`;
  if (loadingPercentage) {
    loadingPercentage.textContent = `100%`;
  }
  setTimeout(() => {
    enterBtn.textContent = "ENTER";
    enterBtn.classList.add("ready");
    sceneReady = true;
  }, 500);
};

enterBtn.addEventListener("click", () => {
  if (enterLocked) return;
  enterLocked = true; 

  floop.play();
  if (!sceneReady) return;

  loadingScreen.classList.add("hidden");
  setTimeout(() => {
    loadingScreen.style.display = "none";
    IntroAnimation();
    Music.play();
    Music.fade(0, 0.5, 3000);
  }, 1500);
});


//Loaders
const textureLoader = new THREE.TextureLoader()

const dracoloader = new DRACOLoader();
dracoloader.setDecoderPath( '/draco/' );

const loader = new GLTFLoader(loadingManager);
loader.setDRACOLoader(dracoloader)

const skybox = new THREE.CubeTextureLoader()
  .setPath('textures/skybox/')
  .load([
    'px.webp',
    'nx.webp',
    'py.webp',
    'ny.webp',
    'pz.webp',
    'nz.webp',
  ]);
scene.background = skybox;  

skybox.rotationY = 45;

//Textures
const Textures = {
  1: {
    day: "textures/world/1_Nairs.webp",
    night: "textures/world/1_Nairs.webp",
  },

  2: {
    day: "textures/world/2_Figurines.webp",
    night: "textures/world/2_Figurines.webp",
  },

  3: {
    day: "textures/world/3_Plushies.webp",
    night: "textures/world/3_Plushies.webp",
  },

  4: {
    day: "textures/world/4_Toolbox.webp",
    night: "textures/world/4_Toolbox.webp",
  },

  5: {
    day: "textures/world/5_Rog.webp",
    night: "textures/world/5_Rog.webp",
  },

  6: {
    day: "textures/world/6_Table.webp",
    night: "textures/world/6_Table.webp",
  },

  7: {
    day: "textures/world/7_Katana.webp",
    night: "textures/world/7_Katana.webp",
  },

  8: {
    day: "textures/world/8_Treasure.webp",
    night: "textures/world/8_Treasure.webp",
  },

  9: {
    day: "textures/world/9_Desk.webp",
    night: "textures/world/9_Desk.webp",
  },

  10: {
    day: "textures/world/10_Signs.webp",
    night: "textures/world/10_Signs.webp",
  },

  11: {
    day: "textures/world/11_Escanor.webp",
    night: "textures/world/11_Escanor.webp",
  },

  12: {
    day: "textures/world/12_Tree.webp",
    night: "textures/world/12_Tree.webp",
  },

  13: {
    day: "textures/world/13_Boombox.webp",
    night: "textures/world/13_Boombox.webp",
  },
}

const loadedTexture = {
  day: {},
  night: {},
}

Object.entries(Textures).forEach(([key, path]) => {
  const dayTexture = textureLoader.load(path.day);
  const nightTexture = textureLoader.load(path.night);
  
  loadedTexture.day[key] = dayTexture;
  loadedTexture.night[key] = nightTexture

  dayTexture.flipY = false;
  nightTexture.flipY = false;

  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  }
);


const Screen = document.createElement("video");
Screen.src = "textures/Acheron2.mp4";
Screen.muted = true;
Screen.loop = true;
Screen.autoplay = true;
Screen.play();

const screenTexture = new THREE.VideoTexture(Screen);
screenTexture.colorSpace = THREE.SRGBColorSpace;
screenTexture.flipY = false;



//Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const raycasterObjects = [];
let clickabou = true;

// Mobile touch state
let lastTouchTime = 0;
let touchMoved = false;

// Update pointer on mouse move (desktop)
window.addEventListener("mousemove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

// Better mobile touch handling
window.addEventListener("touchstart", (event) => {
  event.preventDefault();
  touchMoved = false;
  
  pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
}, { passive: false });

window.addEventListener("touchmove", (event) => {
  event.preventDefault();
  touchMoved = true; // Mark as moved to prevent click if user drags
  
  pointer.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
}, { passive: false });

window.addEventListener("touchend", (event) => {
  event.preventDefault();
  
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTouchTime;
  
  // Prevent double taps and only handle if didn't move much
  if (tapLength < 500 || touchMoved) {
    lastTouchTime = currentTime;
    return;
  }
  
  lastTouchTime = currentTime;
  handleRaycaster();
}, { passive: false });

// Desktop click
window.addEventListener('click', (event) => {
  // Only handle click if it's not from touch device
  if ('ontouchstart' in window) return;
  handleRaycaster();
});

function handleRaycaster() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    // Social links (always allowed)
    if (clickabou) {
      Object.entries(social).forEach(([name, url]) => {
        if (object.name.includes(name)) {
          const newWindow = window.open();
          newWindow.opener = null;
          newWindow.location = url;
          newWindow.target = "_blank";
          newWindow.rel = "noopener noreferrer";
          return;
        }
      });
    }

    // Model interactions
    if (object.name.includes("About") && clickabou) {
      showExclusiveModel(models.about);
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Skills") && clickabou) {
      showExclusiveModel(models.skills);
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Projects") && clickabou) {
      showExclusiveModel(models.work); // Fixed: was models.projects
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Contact") && clickabou) {
      showExclusiveModel(models.contact);
      clickabou = false;
      clouk.play();
    } else if (object.name.includes("Home")) {
      // Home should always work to close models
      clickabou = true;
      clouk.play();
      // Close all models
      Object.values(models).forEach(model => {
        if (model && isModelOpen(model)) {
          hideModel(model);
        }
      });
    }

    // Boombox (always allowed when clickabou is true)
    if (object.name.includes("Boombox") && clickabou) {
      nextSong();
      electro.play();
    }

    // Clear hover
    setTimeout(() => {
      if (currentHovered) {
        playHoverAnimation(currentHovered, false);
        currentHovered = null;
        document.body.style.cursor = 'default';
      }
    }, 300);
  }
}



//Interactions
let chest,
    boombox;
let currentIntersects = [];

const social = {
  "GitHub": "https://github.com/Nairwins",
  "Youtube": "https://www.youtube.com/@nairwin2716",
  "Discord": "https://discord.com/users/nairwin",
}

window.addEventListener('click', handleRaycaster);

//Boombox Animation
function BoomboxAnimation(boombox) {
  // Reset to initial scale first
  boombox.scale.set(
    boombox.userData.initialScale.x,
    boombox.userData.initialScale.y,
    boombox.userData.initialScale.z
  );

  // Create a new timeline specific to this boombox
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
  // Stop the pulse animation
  if (boombox.userData.boomboxAnim) {
    boombox.userData.boomboxAnim.kill();
    boombox.userData.boomboxAnim = null;
  }

  // Smoothly return to the initial scale
  gsap.to(boombox.scale, {
    x: boombox.userData.initialScale.x,
    y: boombox.userData.initialScale.y,
    z: boombox.userData.initialScale.z,
    duration: 0.3,               
    ease: "bounce.out(1.8)",
    onComplete: () => {
      BoomboxAnimation(boombox);
    }
  });
}




//3D World Model
const ropes = [];
const pointers = [];
const figurines = [];
const plants = [];
const dragons = [];

loader.load('models/Firestar.glb',(glb) => {
    glb.scene.traverse((child) => {
      if (child.isMesh) {
        // Video Screens
        if (child.name.includes("Screen")) {
          child.material = new THREE.MeshBasicMaterial({ map: screenTexture });
        }

        // Initial transforms for interactive objects
        if (child.name.includes("Target") || child.name.includes("Hover") || child.name.includes("Pointer")) {
          child.userData.initialScale = new THREE.Vector3().copy(child.scale);
          child.userData.initialRotation = new THREE.Euler().copy(child.rotation);
          child.userData.initialPosition = new THREE.Vector3().copy(child.position);
          child.userData.isAnimating = false;
        }

        // Chest Animation
        if (child.name.includes("ChestTop")) {
            chest = child;

            const ta = gsap.timeline({ repeat: -1, yoyo: true });
            ta.to(chest.rotation, {
                onUpdate: () => chest.rotateX(-0.0012),
                duration: 2,
                ease: "power4.inOut",
            });

            ta.to(chest.rotation, {
                onUpdate: () => chest.rotateX(0.0012),
                duration: 2,
                ease: "power4.inOut",
            });
        }


        // Boombox Animation
        if (child.name.includes("Boombox")) {
          boombox = child;
          BoomboxAnimation(boombox);
        }


        // Intro hiding
        if (child.name.includes("Hang")) {
          ropes.push(child);
          child.scale.set(0, 0, 0);
        }

        if (child.name.includes("Pannel")) {
          pointers.push(child);
          child.scale.set(0, 0, 0);
        }

        if (child.name.includes("Figurine")) {
          figurines.push(child);
          child.scale.set(0, 0, 0);
        }

        if (child.name.includes("Plant")) {
          plants.push(child);
          child.scale.set(0, 0, 0);
        }

        if (child.name.includes("Dragonball")) {
          dragons.push(child);
          child.scale.set(0, 0, 0);
        }


        // Apply textures
        Object.keys(Textures).forEach((key) => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTexture.day[key],
            });
            child.material = material;

            raycasterObjects.push(child);

            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }

            console.log(child.name);
          }
        });
      } 
  });
  scene.add(glb.scene);
});


//Intro Animation
function IntroAnimation() {
  const order = ["Home", "About", "Skills", "Projects", "Contact"];

  //Order set up
  const getIndex = name => {
    for (let i = 0; i < order.length; i++) {
      if (name.includes(order[i])) return i;
    }
    return order.length;
  };

  ropes.sort((a, b) => getIndex(a.name) - getIndex(b.name));
  pointers.sort((a, b) => getIndex(a.name) - getIndex(b.name));

  const count = Math.max(ropes.length, pointers.length);

  //Timelines
  const t1a = gsap.timeline({
    duration: 0.5,
    ease: "back.out(1.7)",
  });

  const t1b = gsap.timeline({
    duration: 0.5,
    ease: "back.out(1.7)",
    delay: 0.35,
  });

  const t2 = gsap.timeline({
    duration: 0.5,
    ease: "back.out(1.7)",
  });

  const t3 = gsap.timeline({
    duration: 0.5,
    ease: "back.out(1.7)",
  });

  //Intros
  ropes.forEach((rope) => {
    t1a.to(rope.scale, { x: 1, y: 1, z: 1 }, "-=0.1");
  })

  pointers.forEach((pannel) => {
    t1b.to(pannel.scale, { x: 1, y: 1, z: 1 }, "-=0.1");
  });

  

  figurines.forEach((figurine) => {
    t2.to(figurine.scale, { x: 1, y: 1, z: 1 }, "-=0.2");
  });

  dragons.forEach((dragon) => {
    t2.to(dragon.scale, { x: 1, y: 1, z: 1 }, "-=0.3");
  });

  plants.forEach((plant) => {
    t3.to(plant.scale, { x: 1, y: 1, z: 1 }, "-=0.3");
  });
}


//Event Listener
window.addEventListener('resize', () => {
  //Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})





//Render
const render = () => {
  controls.update();

  // Raycasting
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
        // Reset previous hovered object
        if (currentHovered) playHoverAnimation(currentHovered, false);

        // Play hover animation for new object
        if (intersected.name.includes("Pannel")) playHoverAnimation(intersected, true);
        else if (intersected.name.includes("Pointer")) playHoverAnimation(intersected, true, 1.3, 0, 0);
        else if (intersected.name.includes("Hover")) playHoverAnimation(intersected, true, 1.3, 0, 0, "power3.out", 0.5);
        else if (intersected.name.includes("Target")) playHoverAnimation(intersected, true, 1.1, 0, 0.1, "power3.out", 0.5);

        currentHovered = intersected;
      }
      if (intersected.name.includes("Pannel") && clickabou || intersected.name.includes("Home"))
        document.body.style.cursor = 'pointer';
      else if (intersected.name.includes("Pointer") && clickabou)
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
    // Nothing intersected
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
