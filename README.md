# Shader materials | Entrega 01 lab

## Integrantes
- Néstor Herrera - Carnet 18-10796
- Jesús Bovea - Carnet 19-10072

## Dependencias utilizadas

El API utilizado es Three.js junto con GLSL para los shaders. Se utilizaron las siguientes dependencias para los shaders y GUI:

- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js v20.13.1](https://nodejs.org/en)
- [Vite](https://vite.dev/)
- [Vite Plugin GLSL](https://www.npmjs.com/package/vite-plugin-glsl)
- [Three.js](https://threejs.org/)
- [lil-gui](https://github.com/georgealways/lil-gui)

## Corriendo el proyecto

1. Clonar el repositorio.
2. Tener instalado Node.js (v20.10+) y un navegador (si estás viendo esto probablemente tienes un navegador).
3. Ejecutar `npm install` para instalar dependencias.
4. Ejecutar `npm run dev` para ejecutar el proyecto usando Three.js, usualmente en el puerto 5173. El comando te dice a que direccion ir en tu navegador.

## Cómo utilizar

En la escena esta cargado un mesh en el cual se puede escoger entre 2 geometrias (Plane o Box) y los 3 materiales programados (Simple Waves, BlinnPhong y CRT) utilizando el menu general de la GUI. Tambien se encuentran ahi los parametros para modificar uniforms de los diferentes materiales en forma de menús desplegables.

Adicional a eso, vale mencionar que para el shader Simple Wave, se puede presionar espacio para activar/desactivar el efecto, y hacer click en el mesh para asignar el valor de displacement (lugar donde se originan las ondas).
