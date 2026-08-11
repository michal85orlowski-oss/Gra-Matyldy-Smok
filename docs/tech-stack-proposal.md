# Propozycja stacku technologicznego dla Gry Matyldy

> Status: dokument zawiera długoterminową propozycję. Aktualny grywalny prototyp nie używa jeszcze Phaser ani TypeScript.

## Aktualna implementacja

- JavaScript ES modules oraz element `<canvas>` do renderowania gry 2D.
- Vite jako lokalny serwer deweloperski i narzędzie budowania.
- Dane sześciu plansz w `src/data/levels/level-01.json`–`level-06.json`.
- Moduły `src/game/constants.js`, `src/game/combat.js` i `src/game/levelLoader.js` dla podstawowej logiki.
- Wbudowany test Node (`tests/combat.test.js`) dla reguły trzech trafień smoka.

Aktualne polecenia:

```bash
npm install
npm run dev
npm test
npm run build
```

## Zalecana technologia

Dla tej gry przeglądarkowej najlepszym wyborem jest:

- TypeScript
- Phaser 3
- Vite
- ESLint + Prettier
- Vitest

## Dlaczego taki wybór

- Phaser 3 dobrze wspiera tworzenie 2D gier w przeglądarce.
- TypeScript zwiększa bezpieczeństwo kodu i ułatwia utrzymanie projektu.
- Vite daje szybki start i wygodny workflow deweloperski.
- Vitest pozwala testować logikę gry bez uruchamiania całej aplikacji.

## Proponowana struktura projektu

```text
gra-matyldy/
├── public/
│   ├── index.html
│   └── assets/
│       ├── sprites/
│       ├── backgrounds/
│       ├── tiles/
│       ├── effects/
│       └── audio/
├── src/
│   ├── main.ts
│   ├── game/
│   │   ├── config.ts
│   │   ├── types.ts
│   │   └── constants.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MenuScene.ts
│   │   ├── LevelScene.ts
│   │   ├── GameOverScene.ts
│   │   └── VictoryScene.ts
│   ├── entities/
│   │   ├── Boy.ts
│   │   ├── Dragon.ts
│   │   ├── Hunter.ts
│   │   └── Projectile.ts
│   ├── systems/
│   │   ├── input.ts
│   │   ├── combat.ts
│   │   └── levelLoader.ts
│   ├── ui/
│   │   └── HUD.ts
│   └── data/
│       └── levels/
├── tests/
│   └── combat.test.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Minimalne zależności

```json
{
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Proponowane skrypty

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  }
}
```

## Plan startu

1. Uruchomić projekt z Vite.
2. Dodać Phaser 3 i prostą scenę startową.
3. Zrobić pierwszy poziom jako prosty prototyp techniczny.
4. Wprowadzić ruch chłopca i smoka.
5. Następnie dodać łowców, strzały i system życia.

## Rekomendacja końcowa

Najbardziej praktyczny wybór to:

- Vite + Phaser 3 + TypeScript

To jest najlepszy kompromis między szybkością startu, wygodą rozwoju i jakością kodu.
