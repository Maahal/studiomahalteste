import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Configuração da cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// JOYSTICK

document.addEventListener('DOMContentLoaded', () => {
  const joystickContainer = document.getElementById('joystickContainer');

  const joystick = nipplejs.create({
      zone: joystickContainer, // Define onde o joystick será renderizado
      mode: 'static',          // Joystick fixo
      position: { left: '50%', top: '50%' },
      color: 'gray',           // Cor do joystick
      size: 100                // Tamanho do joystick
  });

  joystick.on('move', (evt, data) => {
      const forward = -data.vector.y; // Movimento para frente e para trás
      const sideways = data.vector.x; // Movimento lateral

      // Adapte esse código para movimentar o avatar no seu game
      avatar.position.x += sideways * 0.1;
      avatar.position.z += forward * 0.1;
  });

  joystick.on('end', () => {
      // Aqui você pode parar o movimento do avatar quando o joystick não estiver em uso
  });
});


// IMPORTE MAP

const loader = new GLTFLoader();

loader.load(
  '/public/map.glb', // Caminho para o arquivo
  (gltf) => {
    const model = gltf.scene;
    model.position.set(0, 0, 0); // Ajuste a posição
    model.scale.set(1, 1, 1); // Ajuste o tamanho
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true; // Permite sombras
        child.receiveShadow = true;
      }
    });
    scene.add(model); // Adiciona à cena
  },
  (xhr) => {
    console.log(`Carregando: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error('Erro ao carregar o modelo:', error);
  }
);

// Criando o chão
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Criando a rua
const streetGeometry = new THREE.PlaneGeometry(10, 20);
const streetMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const street = new THREE.Mesh(streetGeometry, streetMaterial);
street.rotation.x = -Math.PI / 2;
street.position.y = 0.01;
street.receiveShadow = true;
scene.add(street);

// Criando a calçada
const sidewalkGeometry = new THREE.PlaneGeometry(4, 20);
const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const sidewalkLeft = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
const sidewalkRight = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
sidewalkLeft.rotation.x = -Math.PI / 2;
sidewalkRight.rotation.x = -Math.PI / 2;
sidewalkLeft.position.set(-7, 0.02, 0);
sidewalkRight.position.set(7, 0.02, 0);
sidewalkLeft.receiveShadow = true;
sidewalkRight.receiveShadow = true;
scene.add(sidewalkLeft, sidewalkRight);

// Criando postes de luz
const postMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const lightMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 });
for (let i = -9; i <= 9; i += 6) {
    const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3);
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.set(7, 1.5, i);
    post.castShadow = true;
    scene.add(post);
    
    const lightGeometry = new THREE.SphereGeometry(0.3);
    const lightBulb = new THREE.Mesh(lightGeometry, lightMaterial);
    lightBulb.position.set(7, 3.2, i);
    scene.add(lightBulb);
    
    const pointLight = new THREE.PointLight(0xffffaa, 1, 5);
    pointLight.position.set(7, 3.2, i);
    pointLight.castShadow = true;
    scene.add(pointLight);
}

// Criando função para adicionar casas
function createHouse(x, z) {
  const houseGeometry = new THREE.BoxGeometry(4, 4, 4);
  const houseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const house = new THREE.Mesh(houseGeometry, houseMaterial);
  house.position.set(x, 2, z);
  house.castShadow = true;
  house.receiveShadow = true;
  scene.add(house);

  const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x772200 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(x, 5, z);
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  scene.add(roof);
}

// Adicionando múltiplas casas
createHouse(-11, 0);
createHouse(11, -5);
createHouse(11, 8);

// Criando o avatar
const avatarGeometry = new THREE.BoxGeometry(1, 1, 1);
const avatarMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
avatar.position.y = 0.5;
avatar.castShadow = true;
scene.add(avatar);

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Luz direcional com sombras
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

// Posição inicial da câmera
camera.position.set(0, 5, 10);
camera.lookAt(avatar.position);

// Controles do avatar
const keys = {};
window.addEventListener('keydown', (event) => keys[event.key] = true);
window.addEventListener('keyup', (event) => keys[event.key] = false);

function moveAvatar() {
    if (keys['ArrowUp']) avatar.position.z -= 0.1;
    if (keys['ArrowDown']) avatar.position.z += 0.1;
    if (keys['ArrowLeft']) avatar.position.x -= 0.1;
    if (keys['ArrowRight']) avatar.position.x += 0.1;
    
    // Atualizando a posição da câmera para seguir o avatar
    camera.position.set(avatar.position.x, avatar.position.y + 5, avatar.position.z + 10);
    camera.lookAt(avatar.position);
}

// Ajustar o tamanho ao redimensionar a janela
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Loop de animação
function animate() {
    requestAnimationFrame(animate);
    moveAvatar();
    renderer.render(scene, camera);
}
animate();
