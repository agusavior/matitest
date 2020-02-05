# matitest
matitest es un backend en node.js para agregar tareas (Tasks) a una base de datos mongoDB en mongo Atlas.
Tipo de servicio Restful con autenticación JWT.

### Para iniciarlo
Correr los siguientes comandos:
```
$ npm install

$ npm run install
```

El servidor se iniciará en http://localhost:3000/

### Endpoints públicos:
Estos dos métodos necesitan tener un body en formato JSON.

| Método | URL | Descripción |
| ------ | --- | ------- |
| POST  | /register | Registra un usuario |
| GET   | /login | Retorna el nombre del usuario y también retorna el token necesario para acceder a los endpoints privados |

##### Body para registrarse:
```json
{
  "user" : "myusername2020",
  "pass" : "mys6cr6t",
  "name" : "Jhonny"
}
```

##### Body para loguearse:
```json
{
  "user" : "myusername2020",
  "pass" : "mys6cr6t",
}
```


### Endpoints privados:
Para poder utilizar estos endpoints, primero hay que "loguearse" para obtener el token.
Luego de obtenido el token, hay que crear un header de key 'Authorization' y de valor 'Bearer <TU TOKEN>'.

| Método | URL | Descripción |
| ------ | --- | ------- |
| GET  | /getAllTasks | Retorna una lista con todas las tareas |
| POST   | /createTask/ | Crea una tarea con el body otorgado |
| DELETE   | /removeTask/\<ID\> | Elimina la tarea con la identificación otorgada |
| PUT   | /modifyTask/\<ID\> | Modifica la tarea con la identificación y el body otorgados |
| GET   | /getTask/\<ID\> | Retorna la tarea con la identificación otorgada |

##### Body para crear o modificar un task:
```json
{
  "title" : "Dormir una siesta",
  "stars" : 2,
  "color" : "blue", 
  "done" : true
}
```
