# Plansze — opis roboczy

W tym pliku znajdują się opisy fabularne, cele, przeciwnicy, mechaniki i wygląd wszystkich sześciu plansz. Dane techniczne każdej planszy znajdują się osobno w `src/data/levels/`.

## Zasada przejścia planszy w aktualnym prototypie

- Plansza 1 kończy się po odebraniu jaja i dojściu do lasu. Z jaja wykluwa się smok, po czym wyświetlana jest scenka oswojenia z rysunku 2.
- Plansze 2–6 kończą się dopiero po pokonaniu wszystkich łowców i miotaczy włóczni oraz, gdy występuje, celu fabularnego planszy.
- Łowca lub miotacz znika po trafieniu plazmą smoka. Żaden z nich nie jest niezniszczalny.

## Wspólne zasady sterowania i walki

- Strzałki: ruch chłopca na ziemi oraz sterowanie lotem smoka.
- Spacja: fioletowy strzał plazmą smoka; chłopiec nie atakuje. Kolejne strzały dzieli 1 sekunda, a pocisk leci po skosie w dół.
- Smok zaczyna każdy poziom z 3 serduszkami. Zielona strzała albo włócznia odbiera 1 serduszko.
- Łowcy poruszają się i oddają jeden zielony strzał co 4 sekundy. Strzały i włócznie lecą pod kątem 45°.

## Szablon planszy

### Plansza 1 — Jajo w lesie

- Fragment historii: na początku gry chłopiec wyrusza w stronę miasta. Po dotarciu na miejsce otrzymuje jajo i rusza z nim dalej.
- Cel gracza: przeprowadzić chłopca do miasta, odebrać jajo i dojść z nim do lasu.
- Nowa mechanika: podstawowe poruszanie się chłopca po ziemi.
- Przeciwnicy i zagrożenia: brak — poziom jest bezpiecznym wprowadzeniem do gry.
- Wygląd i rysunki potrzebne od Matyldy: słońce, chmury, drzewo i trawa z rysunku 1 oraz chłopiec i jajo. W aktualnym prototypie punkt startowy obejmuje kolorowe miasteczko, a po podniesieniu jajo jest widoczne przy chłopcu.
- Zakończenie planszy: w lesie z jaja wykluwa się smok. Następnie wyświetla się scenka oswajania smoka z rysunku 2.

### Plansza 2 — Pierwszy lot nad lasem

- Fragment historii: oswojony smok zabiera chłopca w pierwszy wspólny lot nad lasem.
- Cel gracza: pokonać wszystkich łowców i oba miotacze włóczni, a następnie opuścić las.
- Nowa mechanika: sterowanie lotem smoka z chłopcem na jego grzbiecie.
- Przeciwnicy i zagrożenia: około 5 łowców smoków na ziemi oraz 2 wyrzutnie włóczni rozstawione w całym poziomie.
- Wygląd i rysunki potrzebne od Matyldy: las, drzewa, trawa, kwiaty i krzaki z rysunku 3; smok z chłopcem w locie, łowcy i wyrzutnie włóczni.
- Zakończenie planszy: po zniszczeniu wszystkich zagrożeń bohaterowie bezpiecznie opuszczają las i lecą dalej.

### Plansza 3 — Nad lasem i górami

- Fragment historii: chłopiec i smok lecą dalej ponad lasem, a na horyzoncie pojawiają się góry.
- Cel gracza: pokonać wszystkich obrońców górskiej części lasu i przetrwać trudniejsze manewry w locie.
- Nowa mechanika: trudniejsze manewrowanie w locie między elementami krajobrazu.
- Przeciwnicy i zagrożenia: większa liczba łowców smoków niż w poziomie 2; poruszają się i strzelają zielonymi strzałami co 4 sekundy, a wyrzutnie korzystają z włóczni.
- Wygląd i rysunki potrzebne od Matyldy: las, góry w tle, drzewa, trawa, chmury oraz słońce.
- Zakończenie planszy: po pokonaniu wszystkich obrońców bohaterowie docierają do miejsca, w którym łowcy przetrzymują smoka.

### Plansza 4 — Uwolnienie smoka

- Fragment historii: w górach chłopiec i jego smok docierają do obozu łowców smoków.
- Cel gracza: przedostać się przez obóz, pokonać jego obronę i uwolnić uwięzionego smoka.
- Nowa mechanika: atak plazmą na element fabularny — klatkę.
- Przeciwnicy i zagrożenia: poruszający się łowcy smoków, zielone strzały, wyrzutnie włóczni oraz klatka pilnowana przez łowców.
- Wygląd i rysunki potrzebne od Matyldy: górskie tło, obóz łowców i klatki z rysunku 4.
- Zakończenie planszy: po zniszczeniu obrony obozu strzał plazmy niszczy klatkę, a uratowany smok odlatuje. Scena korzysta z rysunku 4.

### Plansza 5 — Ocean łowców

- Fragment historii: po wylocie znad gór bohaterowie wlatują nad ocean, gdzie czekają na nich łodzie łowców smoków.
- Cel gracza: pokonać mniejsze łodzie łowców, a na końcu zatopić duży statek-bossa z rysunku 5.
- Biom: ocean.
- Nowa mechanika: walka nad wodą i unikanie sieci wystrzeliwanej przez statek-bossa co kilka sekund.
- Przeciwnicy i zagrożenia: kilka mniejszych łodzi łowców, które strzelają zielonymi strzałami, oraz duży statek-boss. Trafienie czarną siecią oznacza natychmiastową porażkę — schwytanie smoka.
- Walka z bossem: po 3 trafieniach plazmą łamie się maszt statku; po 5 trafieniach statek płonie; po 6 trafieniach tonie.
- Wygląd i rysunki potrzebne od Matyldy: powierzchnia oceanu, statek łowców, ogień, sieć oraz plazmowe pociski z rysunku 5.
- Zakończenie planszy: po pokonaniu łodzi i szóstym trafieniu statek-boss tonie, a bohaterowie lecą dalej.
- Porażka: po schwytaniu smoka w sieć wyświetlana jest scenka z rysunku 6, po czym poziom rozpoczyna się od nowa.

### Plansza 6 — Lodowiec Smoka Alfa

- Fragment historii: po walce na oceanie bohaterowie lecą nad wodą aż do lodowca.
- Cel gracza: dotrzeć do lodowca, pokonać ostatnie łodzie łowców i uwolnić Lodowego Smoka Alfa.
- Nowa mechanika: finałowy cel wymagający wielokrotnych trafień plazmą; lodowiec nie wykonuje ataków.
- Przeciwnicy i zagrożenia: po drodze do lodowca bohaterowie spotykają dwie łódki łowców smoków.
- Walka finałowa: Lodowy Smok Alfa jest uwięziony w lodowcu. Po 8 trafieniach plazmą zostaje uwolniony.
- Wygląd i rysunki potrzebne od Matyldy: ocean oraz Lodowy Smok Alfa z rysunku 8.
- Zakończenie planszy i gry: po pokonaniu obu łódek i ośmiu trafieniach uwalniających Lodowego Smoka Alfa gra kończy się sukcesem. Pojawia się scenka odlotu smoka z rysunku 7.
