# Klasseninstanz als Property einer anderen Klasse speichern

## Grundidee

In der objektorientierten Programmierung kommt es häufig vor, dass ein Objekt ein anderes Objekt dauerhaft benötigt.

Statt die benötigte Klasse bei jeder Verwendung neu zu instanziieren, wird eine Instanz einmal erzeugt und als Property gespeichert.

```js
this.getReady = new SlidingBanner(world.canvas, "./img/icons/get_ready.png");
```

`this.getReady` enthält danach eine konkrete Instanz der Klasse `SlidingBanner`.

Vereinfacht:

```text
StartScene
└── getReady
    └── SlidingBanner-Instanz
```

Dadurch kann dieselbe Instanz später an verschiedenen Stellen der Klasse verwendet werden:

```js
this.getReady.moveIn();
this.getReady.draw();
```

## Warum ist das wichtig?

Das Objekt behält seinen Zustand zwischen den Methodenaufrufen.

Eine `SlidingBanner`-Instanz kann beispielsweise Eigenschaften besitzen wie:

```js
this.x;
this.y;
this.ready;
this.speed;
```

Wenn `moveIn()` die Position verändert:

```js
this.x -= this.speed;
```

arbeitet `draw()` anschließend mit genau diesem veränderten `x`-Wert:

```js
this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
```

Beide Methoden arbeiten also auf **demselben Objekt**.

## Beispiel aus Angry Forrest

In `StartScene` wird das `GET READY`-Banner einmal erzeugt:

```js
class StartScene {
  constructor(world) {
    this.world = world;

    this.getReady = new SlidingBanner(
      world.canvas,
      "./img/icons/get_ready.png",
    );
  }
}
```

Später kann `StartScene` das Banner bewegen:

```js
this.getReady.moveIn();
```

und zeichnen:

```js
this.getReady.draw();
```

`getReady` ist dabei kein besonderes JavaScript-Schlüsselwort.

Es ist lediglich der selbst gewählte Name einer Property:

```js
this.getReady;
```

Man könnte sie technisch genauso nennen:

```js
this.banner = new SlidingBanner(...);
```

und anschließend:

```js
this.banner.moveIn();
this.banner.draw();
```

Der sprechende Name `getReady` macht jedoch deutlich, welche konkrete Aufgabe diese `SlidingBanner`-Instanz innerhalb der `StartScene` besitzt.

## Gegenbeispiel: jedes Mal eine neue Instanz erzeugen

Folgendes wäre für einen zustandsbehafteten Banner ungeeignet:

```js
new SlidingBanner(world.canvas, "./img/icons/get_ready.png").moveIn();

new SlidingBanner(world.canvas, "./img/icons/get_ready.png").draw();
```

Hier entstehen zwei unterschiedliche Objekte.

Die erste Instanz verändert beispielsweise ihre Position mit `moveIn()`, wird anschließend aber nicht mehr verwendet.

`draw()` arbeitet dann auf einer komplett neuen Instanz, deren `x` wieder am Ausgangspunkt liegt.

Der Zustand geht damit verloren.

## Merksatz

Wenn mehrere Methoden auf **demselben Zustand eines Objekts** arbeiten sollen, lohnt es sich, die Instanz einmal zu erzeugen und als Property zu speichern:

```js
this.object = new SomeClass();
```

Danach kann dieselbe Instanz überall innerhalb des Objekts wiederverwendet werden:

```js
this.object.methodA();
this.object.methodB();
```

Das ist ein grundlegendes Muster objektorientierter Programmierung und ermöglicht es, komplexere Objekte aus mehreren kleineren, spezialisierten Objekten zusammenzusetzen.
