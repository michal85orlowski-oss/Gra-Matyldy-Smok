# Gra Matyldy

Platformowa gra o chłopcu i oswojonym smoku. Celem jest przejście przez sześć plansz, pokonanie łowców smoków i odnalezienie Lodowego Smoka Alfa.

## Proponowana technologia

- JavaScript + Phaser 3 — silnik 2D do platformówek w przeglądarce.
- Grafiki postaci tworzone na podstawie rysunków Matyldy.
- Dane plansz trzymane poza kodem, aby można je było łatwo dopracowywać.

## Struktura projektu

```text
Gra Matyldy/
├── AGENTS.md                 # zasady współpracy z Codex
├── README.md                 # krótki opis projektu
├── package.json              # zależności i polecenia uruchomieniowe
├── public/
│   ├── index.html            # strona startowa gry
│   └── assets/
│       ├── source-drawings/  # oryginalne skany/zdjęcia rysunków Matyldy
│       ├── sprites/          # wycięte i przygotowane postacie
│       ├── backgrounds/      # tła plansz
│       ├── tiles/            # ziemia, platformy, dekoracje
│       ├── effects/          # strzały, wybuchy, animacje trafień
│       └── audio/            # muzyka i efekty dźwiękowe
├── src/
│   ├── main.js               # konfiguracja i start gry
│   ├── config/
│   │   └── gameConfig.js     # stałe: 3 trafienia, fizyka, sterowanie
│   ├── scenes/
│   │   ├── BootScene.js      # przygotowanie aplikacji
│   │   ├── PreloadScene.js   # wczytywanie zasobów
│   │   ├── MenuScene.js      # ekran tytułowy
│   │   ├── LevelScene.js     # wspólna logika plansz
│   │   ├── GameOverScene.js  # upadek smoka i restart
│   │   └── VictoryScene.js   # zakończenie po 8. planszy
│   ├── entities/
│   │   ├── Boy.js            # chłopiec poruszający się po ziemi
│   │   ├── Dragon.js         # smok, lot i licznik trafień
│   │   ├── DragonHunter.js   # łowca strzelający zielonymi strzałami
│   │   └── GreenArrow.js     # pocisk przeciwnika
│   ├── systems/
│   │   ├── controls.js       # klawiatura/pad
│   │   ├── combat.js         # kolizje i obrażenia
│   │   └── levelLoader.js    # wczytywanie danych plansz
│   ├── ui/
│   │   └── Hud.js            # życie smoka, numer planszy, komunikaty
│   └── data/
│       └── levels/           # level-01.json ... level-06.json
├── content/
│   └── levels.md             # opis fabularny i projekt 6 plansz
├── tests/                    # testy logiki gry
└── docs/
    └── art-guide.md          # wskazówki przygotowania rysunków do gry
```

## Zasady rozgrywki

- Chłopiec chodzi i skacze po ziemi; w wybranych fragmentach dosiada smoka i lata.
- Łowcy smoków pozostają na ziemi i strzelają zielonymi strzałami.
- Trzy trafienia smoka oznaczają jego upadek, ekran końca gry i restart bieżącej planszy.
- Każda plansza ma osobny plik danych (`src/data/levels/level-01.json` do `level-06.json`).
- Opisy, fabuła i cele plansz należą do `content/levels.md`, nie do kodu.
