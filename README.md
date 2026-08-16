# Jeźdcy smoków na końcu świata

Rodzinna gra przeglądarkowa o chłopcu i oswojonym smoku. W sześciu planszach bohaterowie uczą się współpracować, pokonują łowców smoków i uwalniają Lodowego Smoka Alfa.

## Aktualny prototyp

- Gra działa w przeglądarce jako aplikacja JavaScript + Canvas, uruchamiana przez Vite.
- Plansza 1 jest bezpiecznym wprowadzeniem: chłopiec chodzi, skacze, odbiera jajo i idzie do lasu. Po niej pojawia się scenka oswojenia smoka.
- W planszach 2–6 chłopiec siedzi na smoku i steruje lotem strzałkami.
- Postacie korzystają z zaakceptowanego atlasu Matyldy; różowe techniczne tło atlasu jest usuwane podczas ładowania. Docelowe wymiary na planszy to: chłopiec 32 × 57 px, smok z jeźdźcem 96 × 64 px, łowca 30 × 39 px i miotacz włóczni 40 × 32 px.
- W pierwszej planszy chłopiec odbiera jajo przy kolorowym miasteczku; po podniesieniu niesie je do lasu.
- Tylko smok zionie fioletową plazmą. Spacja uruchamia strzał nie częściej niż raz na sekundę; plazma leci po skosie w dół.
- Łowcy i miotacze włóczni zwracają się w stronę bohatera i atakują zielonymi pociskami pod kątem 45° co 4 sekundy; nad wodą łowcy płyną w łódkach, które toną po zniszczeniu.
- Smok ma trzy serduszka. Trzecie trafienie wywołuje ekran porażki i restart bieżącej planszy.
- Czarna sieć ze statku na planszy 5 chwyta smoka natychmiast i pokazuje scenkę z rysunku 6. Po uwolnieniu smoka w planszy 4 wyświetla się rysunek 4, a finał planszy 6 pokazuje uwolnionego Smoka Alfa na rysunku 8.
- W planszy 5 statek łowców płonie po ciężkich trafieniach, a po zniszczeniu przechyla się i tonie.
- W planszach 2–6 do dalszej planszy prowadzi pokonanie wszystkich łowców, miotaczy oraz celu fabularnego, jeśli występuje.

## Uruchomienie

Wymagany jest Node.js 20 lub nowszy.

```powershell
cd "C:\Users\micha\Desktop\Gra Matyldy"
npm install
npm run dev
```

Następnie otwórz adres wyświetlony przez Vite, zwykle `http://localhost:5173/`. Nie zamykaj terminala, dopóki grasz.

## Sterowanie

- `←` / `→` — chodzenie chłopca lub lot smoka w poziomie.
- `↑` — skok na planszy 1 lub lot smoka w górę.
- `↓` — lot smoka w dół.
- `Spacja` — fioletowa plazma smoka podczas lotu.

## Struktura projektu

```text
├── index.html                         # punkt startowy Vite
├── public/
│   ├── style.css                      # wygląd strony i interfejsu
│   └── assets/
│       ├── source-drawings/           # oryginalne rysunki Matyldy — bez zmian
│       ├── previews/                  # obrócone podglądy rysunków do scenek
│       └── sprites/                   # przygotowane zasoby postaci
├── src/
│   ├── main.js                        # pętla gry, renderowanie i interakcje
│   ├── game/
│   │   ├── constants.js               # stałe rozgrywki
│   │   ├── combat.js                  # punkty wytrzymałości smoka
│   │   └── levelLoader.js             # wczytanie danych plansz
│   └── data/levels/                   # level-01.json ... level-06.json
├── content/levels.md                  # fabuła i projekt plansz
└── tests/combat.test.js               # test reguły trzech trafień
```

## Zasady dotyczące rysunków Matyldy

Oryginalne rysunki przechowujemy bez zmian w `public/assets/source-drawings/`. Nowe zasoby do gry trafiają do właściwego podfolderu w `public/assets/`; nie zastępujemy rysunków Matyldy grafikami stockowymi.
