# Gra Matyldy — instrukcja dla Codex

## Cel projektu

Tworzymy rodzinną, dwuwymiarową platformówkę w stylu klasycznych gier zręcznościowych. Chłopiec kupuje jajo, z którego wykluwa się smok; potem uczy się z nim współpracować i broni go przed łowcami smoków. Gra obejmuje sześć plansz.

## Najważniejsze zasady gry

- Bohater porusza się po ziemi, skacze i może latać, dosiadając smoka.
- Łowcy stoją na ziemi i strzelają zielonymi strzałami.
- Smok ma dokładnie 3 punkty wytrzymałości. Trzecie trafienie powoduje upadek smoka, ekran `Game Over` i restart aktualnej planszy.
- Sterowanie: strzałki poruszają chłopcem na ziemi i smokiem w locie; spacja wystrzeliwuje plazmę. Plazma nie ma limitu, ale kolejne strzały dzieli 1 sekunda.
- Włócznia działa tak samo jak zielona strzała. Po rozpoczęciu każdego poziomu smok ma pełne 3 serduszka.
- Łowcy poruszają się i oddają jeden strzał co 4 sekundy.
- Każda plansza musi mieć czytelny punkt startu, cel i bezpieczne miejsce na naukę nowej mechaniki.
- Nie wolno zapisywać opisów plansz na stałe w kodzie. Używaj `content/levels.md` dla opisów oraz `src/data/levels/` dla danych technicznych.

## Grafiki Matyldy

- Oryginalne rysunki zawsze zachowuj bez zmian w `public/assets/source-drawings/`.
- Gotowe zasoby do gry umieszczaj w odpowiednich podfolderach `public/assets/`.
- Nie zastępuj rysunków Matyldy grafikami stockowymi ani materiałami objętymi niejasną licencją.
- Styl powinien pozostać dziecięcy, ręcznie rysowany, kolorowy i przyjazny; przeciwnicy nie mogą być drastyczni ani przerażający.

## Sposób pracy

1. Przed zmianą mechaniki sprawdź, czy jest opisana w tym pliku lub w `content/levels.md`.
2. Zachowuj małe, niezależne moduły: sceny, postacie, systemy i interfejs użytkownika osobno.
3. Przy dodawaniu planszy zmień jej JSON i opis w `content/levels.md`.
4. Po zmianach uruchom dostępne testy oraz sprawdź ręcznie sterowanie, kolizje i restart po trzecim trafieniu.
5. Nie usuwaj istniejących rysunków, poziomów ani treści użytkownika bez wyraźnej prośby.

## Konwencje

- Kod i nazwy plików: angielski, `camelCase` w JavaScript, `kebab-case` dla nazw zasobów.
- Teksty widoczne w grze: polski.
- Plansze: `level-01.json` do `level-06.json`.
- Kolor strzał łowców: zielony; nie zmieniaj go bez decyzji projektowej.
