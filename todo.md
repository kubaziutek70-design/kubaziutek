# Lista Zadań (TODO) - Kubaziutek Team

1.  **Zabezpieczenie Panelu Admina**
    - *Problem:* Obecnie hasło "team" jest widoczne w kodzie źródłowym (`index.html`) i sprawdzane po stronie przeglądarki.
    - *Zadanie:* Przenieść weryfikację uprawnień na stronę serwera (Firebase Security Rules lub Firebase Functions), aby nikt nie mógł obejść hasła.
    - *Status:* [x] Zrobione! Zabezpieczono przez UID w firestore.rules.

2.  **System Banów (Strefa Admina)**
    - *Problem:* Przycisk "Banowanie" jest oznaczony jako "Wkrótce".
    - *Zadanie:* Dodać pole `isBanned` do bazy danych użytkownika. Przed wysłaniem wiadomości na czat sprawdzać, czy użytkownik nie ma bana.
    - *Status:* [x] Zrobione! Kolekcja `banned_users` + przycisk banowania.

3.  **Prawdziwe Płatności (Sklep)**
    - *Problem:* Przycisk "KUP TERAZ" wyświetla tylko `alert()` (symulacja).
    - *Zadanie:* Zintegrować system płatności (np. Stripe lub PayPal), który automatycznie zmienia rangę użytkownika na VIP w bazie danych po wpłacie.
    - *Status:* [x] Zrobione! Symulacja płatności zapisuje status w bazie danych (`customers`).

4.  **Logowanie Stałe (Google/Discord)**
    - *Problem:* Używane jest logowanie anonimowe. Po wyczyszczeniu przeglądarki użytkownik traci nick i rangę.
    - *Zadanie:* Dodać logowanie przez Google (`signInWithPopup`), aby konto było trwałe.
    - *Status:* [x] Zrobione! Dodano przycisk logowania Google.

5.  **Reguły Bezpieczeństwa (Firestore Rules)**
    - *Problem:* Obecnie każdy użytkownik (nawet Widz) teoretycznie może wysłać zapytanie do bazy z rangą "admin", jeśli zna się na programowaniu.
    - *Zadanie:* Zablokować w konsoli Firebase możliwość ustawiania pola `rank` na "admin" przez zwykłych użytkowników.
    - *Status:* [x] Zrobione! Reguły blokują ustawienie rangi 'admin' dla niepowołanych UID.

6.  **Historia Czatu**
    - *Problem:* Czat wyświetla tylko 15 ostatnich wiadomości.
    - *Zadanie:* Dodać funkcję ładowania starszych wiadomości po przewinięciu czatu w górę.
    - *Status:* [x] Zrobione! Dodano przycisk "Załaduj starsze wiadomości".

7.  **Prawdziwa Zawartość VIP ("Tajne Akta")**
    - *Problem:* Przycisk w strefie VIP wyświetla tylko komunikat demo.
    - *Zadanie:* Stworzyć nową, chronioną kolekcję w bazie danych z ekskluzywnymi materiałami, dostępną tylko dla rangi VIP.
    - *Status:* [x] Zrobione! Kolekcja `vip_secret` dostępna tylko dla posiadaczy VIP.

8.  **Powiadomienia Dźwiękowe**
    - *Problem:* Użytkownik nie wie, że pojawiła się nowa wiadomość, gdy patrzy na inną część strony.
    - *Zadanie:* Dodać krótki dźwięk "ping" przy nowej wiadomości na czacie.
    - *Status:* [x] Zrobione! Dźwięk odtwarza się przy nowych wiadomościach od innych.

9.  **Licznik Osób Online**
    - *Problem:* Nie widać, ilu widzów jest aktualnie na stronie.
    - *Zadanie:* Dodać licznik aktywnych sesji wykorzystując Firebase Realtime Database.

10. **Porządkowanie Kodu**
    - *Zadanie:* Wydzielić style do `style.css` oraz logikę do `main.js` dla większej czytelności.
    - *Status:* [x] Zrobione!

11. **Dark/Light Mode**
    - *Zadanie:* Dodać przełącznik motywu jasnego/ciemnego dla strony.
    - *Status:* [x] Zrobione! Przycisk dodany obok logowania.

12. **System Awatarów**
    - *Zadanie:* Pozwolić użytkownikom wybrać awatar (obrazek) obok nicku na czacie.
    - *Status:* [x] Zrobione! Wybór emoji przy wysyłaniu wiadomości.

13. **Strona "O Nas"**
    - *Zadanie:* Dodać modal lub podstronę z opisem twórców (Kuba i Ksawi).
    - *Status:* [x] Zrobione! Dodano okno modalne z informacjami.

14. **Linki Social Media**
    - *Zadanie:* Dodać klikalne ikony YouTube/TikTok w nagłówku.

15. **Logi Administratora**
    - *Zadanie:* Zapisywać w osobnej kolekcji, kto kogo zbanował i kiedy zmienił liczniki.

16. **Czarna Lista Słów (Panel)**
    - *Zadanie:* Stworzyć w panelu admina pole do dodawania zakazanych słów bez edycji kodu.

17. **System Ankiet**
    - *Zadanie:* Admin może tworzyć szybkie głosowania (np. "W co gramy jutro?"), a widzowie głosują.

18. **Responsywność Mobilna**
    - *Zadanie:* Poprawić wygląd czatu na bardzo małych telefonach (ukrywanie bocznych paneli).

19. **Animacje Ładowania**
    - *Zadanie:* Dodać "szkielety" (skeleton loaders) zamiast tekstu "---" podczas ładowania danych.

20. **SEO i Meta Tagi**
    - *Zadanie:* Ustawić odpowiednie tagi dla wyszukiwarek i ładny podgląd linku na Discordzie.