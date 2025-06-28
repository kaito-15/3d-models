const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(0, 100, 200);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// 地面
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshLambertMaterial({ color: 0xe0e0e0 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 光源
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 100, 100);
scene.add(light);

// GeoJSONから建物を読み込み
fetch('buildings.geojson')
  .then(res => res.json())
  .then(data => {
    data.features.forEach(feature => {
      const coords = feature.geometry.coordinates[0];
      const shape = new THREE.Shape();

      coords.forEach(([lon, lat], i) => {
        // 緯度経度→メートル座標（ざっくり）
        const x = (lon - 139.767) * 100000;
        const y = (lat - 35.681) * 100000;

        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });

      // 高さをタグ or デフォルトで
      const height = parseFloat(feature.properties.tags?.height || 10);

      const extrudeSettings = {
        steps: 1,
        depth: height,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const building = new THREE.Mesh(geometry, material);
      scene.add(building);
    });
  });

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
