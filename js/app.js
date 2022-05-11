import * as THREE from 'three';
import vertexShader from'./shaders/vertexShader.glsl';
import fragmentShader from'./shaders/fragmentShader.glsl';

import animation from './animation'
new animation()

let scrollable = document.querySelector('.scrollable');

let current = 0;
let target = 0;
let ease = 0.075;

// Interpolation linéaire utilisée pour un défilement fluide et un réglage uniforme du décalage de l'image
function lerp(start, end, t){
    return start * (1 - t ) + end * t;
}

// Fonction "init" déclenchée au chargement de la page pour définir la hauteur du corps pour permettre le défilement et EffectCanvas initialisé
function init(){
    document.body.style.height = `${scrollable.getBoundingClientRect().height}px`;
}

// La div "scrollable" est traduit à l'aide de la fonction "lerp" pour un effet de défilement fluide.
function smoothScroll(){
    target = window.scrollY;
    current = lerp(current, target, ease);
    scrollable.style.transform = `translate3d(0,${-current}px, 0)`;
}

class EffectCanvas{
    constructor(){
        this.container = document.querySelector('main');
        this.images = [...document.querySelectorAll('img')];
        this.meshItems = []; // Utilisé pour stocker tous les maillages que nous allons créer.
        this.setupCamera();
        this.createMeshItems();
        this.render()
    }

    // La fonction "get" est utilisée pour obtenir les dimensions de l'écran utilisées pour les matériaux de la caméra et du maillage
    // A savoir: En JavaScript, la méthode getter est utilisée pour accéder aux propriétés d'un objet.
    get viewport(){
        let width = window.innerWidth;
        let height = window.innerHeight;
        let aspectRatio = width / height;
        return {
          width,
          height,
          aspectRatio
        };
    }

    setupCamera(){
        
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    
        // Création d'une nouvelle scène
        this.scene = new THREE.Scene();
    
        // Initialise la perspective camera
    
        let perspective = 1000;
        const fov = (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI; // voir l'image "fov" pour une répartition de l'image de ce paramètre "fov".
        this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 1, 1000)
        this.camera.position.set(0, 0, perspective); // défini la position de la caméra sur l'axe z.
        
        // renderer
        // this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.viewport.width, this.viewport.height); // utilise la fonction "getter viewport" ci-dessus pour définir la taille decanvas / renderer
        this.renderer.setPixelRatio(window.devicePixelRatio); // Importe pour nous assurer que les textures de l'image n'apparaissent pas floues.
        this.container.appendChild(this.renderer.domElement); // ajoute le canevas à l'élément principal
    }

    onWindowResize(){
        init();
        this.camera.aspect = this.viewport.aspectRatio; // réajuste le rapport hauteur/largeur.
        this.camera.updateProjectionMatrix(); // Utilisé pour calculer les dimensions de la projection.
        this.renderer.setSize(this.viewport.width, this.viewport.height); 
    }

    createMeshItems(){
        // Parcoure toutes les images en boucle et crée de nouvelles instances de MeshItem. Pousse ces instances vers le tableau "meshItems".
        this.images.forEach(image => {
            let meshItem = new MeshItem(image, this.scene);
            this.meshItems.push(meshItem);
        })
    }

    // Anime le défilement lisse et les maillages. Appel répété à l'aide de requestanimationdrame
    render(){
        smoothScroll();
        for(let i = 0; i < this.meshItems.length; i++){
            this.meshItems[i].render();
        }
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.render.bind(this));
    } 
}

class MeshItem{
    // Passe dans la scène car nous ajouterons des maillages à cette scène.
    constructor(element, scene){
        this.element = element;
        this.scene = scene;
        this.offset = new THREE.Vector2(0,0); // Positions du maillage à l'écran. Sera mis à jour ci-dessous.
        this.sizes = new THREE.Vector2(0,0); // Taille du maillage à l'écran. Sera mis à jour ci-dessous.
        this.createMesh();
    }

    getDimensions(){
        const {width, height, top, left} = this.element.getBoundingClientRect();
        this.sizes.set(width, height);
        this.offset.set(left - window.innerWidth / 2 + width / 2, -top + window.innerHeight / 2 - height / 2); 
    }

    createMesh(){
        this.geometry = new THREE.PlaneBufferGeometry(1,1,100,100);
        this.imageTexture = new THREE.TextureLoader().load(this.element.src);
        this.uniforms = {
            uTexture: {
                //texture data
                value: this.imageTexture
              },
              uOffset: {
                // force de distorsion (distorsion strength)
                value: new THREE.Vector2(0.0, 0.0)
              },
              uAlpha: {
                // opacity
                value: 1.
              }
        };
        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            // wireframe: true,
            side: THREE.DoubleSide
        })
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.getDimensions(); // défini le décalage et les tailles pour le placement sur la scène
        this.mesh.position.set(this.offset.x, this.offset.y, 0);
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

        this.scene.add( this.mesh );
    }

    render(){
        // cette fonction est appelée à plusieurs reprises pour chaque instance dans ce qui précède
        this.getDimensions();
        this.mesh.position.set(this.offset.x, this.offset.y, 0)
		this.mesh.scale.set(this.sizes.x, this.sizes.y, 1)
        this.uniforms.uOffset.value.set(this.offset.x * 0.0, -(target- current) * 0.0003 )
    }
}

init()
new EffectCanvas()
