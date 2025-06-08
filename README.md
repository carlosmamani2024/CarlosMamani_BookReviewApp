# Actualizacion_de_MiComidaFavorita
Ejercicio Univalle Posgrado

# MiComidaFavorita
## Instrucciones de instalación

1. Clona el repositorio: https://github.com/carlosmamani2024/MiComidaFavorita.git
2. Instala las dependencias: npm install
3. Configura Firebase (Authentication, Firestore, Storage) y actualiza `config/firebase.js` con tus credenciales.
4. Ejecuta la aplicación: npx expo start o expo start


## Mejoras implementadas

# 📚 CarlosMamani_BookReviewApp

Aplicación móvil desarrollada con **React Native + Expo** para gestionar libros y reseñas de lectura. Permite a los usuarios autenticados crear su propia biblioteca, calificar libros y dejar reseñas.

🔗 Repositorio en GitHub:  
[https://github.com/carlosmamani2024/CarlosMamani_BookReviewApp] (https://github.com/carlosmamani2024/CarlosMamani_BookReviewApp)


## 🧾 Resumen del Proyecto

Esta app permite a los usuarios:

- Iniciar sesión y registrarse.
- Agregar libros a su biblioteca personal.
- Escribir, editar y eliminar reseñas de libros.
- Ver calificaciones promedio y comentarios de otros usuarios.
- Usar navegación condicional para una experiencia personalizada.

---

## 🧍‍♂️ 1. Pantalla de Perfil (`ProfileScreen`)

- Muestra la información del usuario.
- Consulta y muestra los libros agregados a la biblioteca personal.
- Consulta y muestra las reseñas escritas por el usuario.
- Calcula y muestra el promedio de calificaciones dadas por el usuario.

---

## 📖 2. Pantalla de Detalle de Libro (`BookDetailScreen`)

- Muestra:
  - Imagen del libro.
  - Título, autores y descripción.
- Calcula y muestra la **calificación promedio** basada en reseñas.
- Lista todas las reseñas del libro, ordenadas por fecha.
- Permite:
  - Agregar el libro a la biblioteca personal (si aún no está).
  - Crear, editar o eliminar reseñas del usuario autenticado.
- Usa navegación condicional para regresar a "Mi Biblioteca" si se vino desde ahí.

---

## 📝 3. Formulario para Crear Reseñas (`ReviewFormScreen`)

- Permite al usuario autenticado:
  - Escribir un comentario.
  - Calificar con estrellas.
- Valida que el comentario y calificación estén presentes antes de enviar.
- Guarda la reseña en **Firestore** vinculada al libro y al usuario.
- Proporciona feedback visual para:
  - Estado de carga.
  - Errores.

---

## ✏️ 4. Edición de Reseñas (`EditReviewScreen`)

- Permite editar:
  - Comentario.
  - Calificación.
- Valida que el comentario no esté vacío.
- Actualiza los datos correspondientes en **Firestore**.
- Maneja estados de carga y errores, mostrando mensajes adecuados al usuario.

---

> 🔧 Proyecto desarrollado como parte del Módulo 5 del Diplomado en Desarrollo de Aplicaciones Móviles.
