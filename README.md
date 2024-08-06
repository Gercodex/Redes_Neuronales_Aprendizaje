# Redes Neuronales Aprendizaje

Aplicación para crear y entrenar redes neuronales simples mediante Javascript.

## Ejemplo de creación

https://github.com/user-attachments/assets/a68b6dbe-f572-4fbb-9a56-3d0d5ad618c3

## Descripción:

Existen dos opciones a elegir: Lienzo y Datos.

* Lienzo: Se crea un espacio para dibujar ingresando el alto y ancho de la imagen, se especifican los nodos de salida de la red neuronal.
          A cada dibujo se le asigna un número de nodo de salida, preferentemente lo más similares posible entre dibujos por cada numero asignado en los nodos de salida.
          Si debe dar click la primer vez al radio boton 0 ya que aunque esté seleccionado este asigna el valor del nodo a la muestra.
          El valor de RL permite dar saltos de valor durante el entrenamiento, esto permite alcanzar más rápido (en teoría menos iteraciones) el entrenamiento,
          sin embargo, valores muy altos o muy bajos pueden dar lugar a errores por NAN ya que el sistema no soporta números muy pequeños y al ser grandes el entrenamiento
          hace minúsculas las variaciones entre entrenamientos.
          El valor de iteraciones permite asignar el numero de "vueltas" de ejecución de la red neuronal y backpropagation para el "aprendizaje", sin embargo,
          valores más altos con las condiciones correctas dan lugar a un mayor porcentaje de certeza a la hora de verificar las entradas con la respuesta esperada, aunque
          una mala condición puede dar lugar a iteraciones innecesarias ya que la red también tiende a no "aprender" debido costes inamovibles durante el entrenamiento; un
          valor bajo de iteraciones puede ser idóneo para redes muy pequeñas (ver ejemplo con números binarios) ya que los valores por defecto son aquellos que se han probado
          con cierta tendencia a que el entrenamiento sea exitoso.
          Otras condiciones determinantes son los valores aleatorios asignados a los pesos (w), bias (b) por lo que dichos valores pueden afectar a la red que no permita "aprender".
  
* Datos:  La columna de la izquierda representan los valores o nodos de entrada de la red neuronal, los de la derecha representan los nodos de salida de la red que se "activarán"
          de acuerdo con las condiciones programadas para la red.

* Capas:  Es importante mencionar que la aplicación trabaja con redes full-conected por lo tanto las capas representan cada una de las interconexiones desde la entrada de datos
          pasando por cada una de las capas, cada una con la cantidad de nodos definidas en ellas y la última que representa los nodos de salida o resultados.          

¡Importante: Los nodos de la capa final se recomienda sean en la misma cantidad que los definidos para los nodos de salida de los datos tanto en radio button como en la columna derecha para datos binarios.


## Ejemplo de entrenamiento y verificación de "aprendizaje"

https://github.com/user-attachments/assets/2e3271c6-30d6-4ee8-a964-8f9a869f549d

## Descripción:

Se recomienda abrir la consola para ver la evolución del entrenamiento, los valores del coste total disminuye es decir tiene a 0.0000 que sería un indicativo que la red va por buen camino
en teoría, ya que también pueden existir condiciones que hagan creer que la red está "aprendiendo" esto no se puede verificar si no hasta el final de las iteraciones, aunque pueden existir
ciertos indicios cuando los números no son homogéneos en el coste y alguno de los nodos tiene un número mucho mayor, en tales casos se recomienda interrumpir la ejecución y probar con otra configuración.

Para caracteres muy grandes es muy común que la red no pueda funcionar correctamente ya que para grandes cantidades de nodos la sumatoria de todos los nodos de una capa de la red puede estar
demasiado 'atomizada' lo que requeriría números demasiado pequeños que el sistema no soporta, es en este punto que se recurre a filtros u otro tipo de técnicas como la convolusión para crear
bloques que permitan trabajar con imágenes de alta resolución, de acuerdo con lo que he podido ver con esta pequeña aplicación.

Los resultados de la derecha muestran el número de nodo y el resultado de alimentar la red neuronal con los datos, por ejemplo si la letra coincide en un alto porcentaje el nodo que representa
dicha letra mostrará un número que se aproxima a 0.9999... en caso opuesto tiende a 0.00... aunque esto es relativo ya que aunque el carácter o dato sea similar en apariencia en el dibujo, 
solo responderá en un alto porcentaje en la posición y nodos que sean muy próximos a lo entrenado, si el dibujo o caracter se haya desplazado derecha, izquierda, etc la red no lo tomará como
el caracter o dibujo más parecido, si no a la coincidencia desde el punto en que se dibujó.


## Ejemplo de creación, entrenamiento y verificación de "aprendizaje" utilizando datos binarios

https://github.com/user-attachments/assets/268cb71a-a69c-4401-a1eb-92be34bb855b

## Descripción:

Los elementos de la izquierda representan los nodos de entrada y los de la derecha los nodos de salida. Por cada entrada se configura un valor de salida.


## Notas:

Es una aplicación de prueba para aprender sobre redes neuronales y apredizaje, por lo que es posible que contenga errores, y en algunos casos el navegador no responda,
usar con precaución.


## Fuentes:

Algunos canales que me inspiraron para tratar de hacer esta aplicación para aprender y entender redes neuronales:

Dot CSV: APRENDE Qué son las redes neuronales?...,...

3Blue1Brown: But whats is a neural network?...,...


## Sobre el autor:

https://www.linkedin.com/in/gerardo-gutierrez-rodriguez-37629a196/









