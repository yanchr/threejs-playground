import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import { DoubleSide } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
 const dracoLoader = new DRACOLoader()
 dracoLoader.setDecoderPath('draco/')
 
 // GLTF loader
 const gltfLoader = new GLTFLoader()
 gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Materials
*/
const basicMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
})

const basicDarkMaterial = new THREE.MeshBasicMaterial({
    color: 0x444444,
})

const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x5555ff,
    side: DoubleSide
})

const sliderMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
})
/**
 * Objects
 */
const allMeshes = new THREE.Group()
const firstAnimationMeshes = new THREE.Group()
const coffeMeshes = new THREE.Group()
allMeshes.add(firstAnimationMeshes, coffeMeshes)
// Animation
let mixer = null
gltfLoader.load(
    'first-animation.glb',
    (gltf) => 
    {
        // gltf.scene.children.forEach(child => {
        //     console.log(child)
        //     child.material = basicMaterial
        //     firstAnimationMeshes.add(child)
        // })
        const children = [...gltf.scene.children]
        for (const child of children) {
            child.material = basicMaterial
            firstAnimationMeshes.add(child)
        }
        firstAnimationMeshes.scale.set(0.06, 0.06, 0.06)
        const plane = firstAnimationMeshes.children.find((child) => child.name === 'Plane')
        const slider = firstAnimationMeshes.children.find((child) => child.name === 'Cube')

        mixer = new THREE.AnimationMixer(firstAnimationMeshes)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()

        plane.material = planeMaterial
        slider.material = sliderMaterial
    }
)

gltfLoader.load(
    'coffee.glb',
    (gltf) => 
    {
        const children = [...gltf.scene.children]
        for (const child of children) {
            child.material = basicDarkMaterial
            if(child.children.length >= 1){
                child.children.forEach(smallChild => {
                    smallChild.material = basicMaterial
                })
            }
            coffeMeshes.add(child)
        }
        coffeMeshes.rotateY(-Math.PI / 2)

        const screen = coffeMeshes.children.find((child) => child.name === 'Screen')
        const handle1 = coffeMeshes.children.find((child) => child.name === 'hanlde-1')
        const handle2 = coffeMeshes.children.find((child) => child.name === 'hanlde-2')
        const gridRight = coffeMeshes.children.find((child) => child.name === 'grid-right')
        const gridLeft = coffeMeshes.children.find((child) => child.name === 'grid-left')
        screen.material = basicMaterial
        handle1.material = basicMaterial
        handle2.material = basicMaterial
        gridRight.material = basicMaterial
        gridLeft.material = basicMaterial
    }
)

firstAnimationMeshes.position.y = -2
scene.add(allMeshes)

const sphere = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({color: 0xff0000})
)
//scene.add(sphere)

/**
 * Lights
 */
 const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
 scene.add(ambientLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

let cameraXValue = camera.position.x
let cameraZValue = camera.position.z
let meshesYValue = 0
function moveCameraOnX(value) {
    cameraXValue += value
}

function moveCameraOnZ(value) {
    cameraZValue += value
}

function moveMeshesOnY(value){
    meshesYValue += value
}

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Click events
 */
document.addEventListener('keydown', logKey)

function logKey(e) {
    switch(e.key){
        case 'ArrowRight':
            moveCameraOnX(2)
            break
        case 'ArrowLeft':
            moveCameraOnX(-2)
            break
        case 'ArrowUp':
            moveCameraOnZ(-2)
            break
        case 'ArrowDown':
            moveCameraOnZ(2)
            break
        case 'u':
            moveMeshesOnY(2)
            break
        case 'd':
            moveMeshesOnY(-2)
            break
    }
}
/**
 * Animate
 */
const clock = new THREE.Clock()

let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // Animation update
    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Camera movement
    if (cameraXValue > camera.position.x){
        camera.position.x += deltaTime
    }
    if (cameraXValue < camera.position.x){
        camera.position.x -= deltaTime
    }
    if (cameraZValue > camera.position.z){
        camera.position.z += deltaTime
    }
    if (cameraZValue < camera.position.z){
        camera.position.z -= deltaTime
    }


    if (meshesYValue > allMeshes.position.y){
        allMeshes.position.y += deltaTime
    }
    if (meshesYValue < allMeshes.position.y){
        allMeshes.position.y -= deltaTime
    }
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()