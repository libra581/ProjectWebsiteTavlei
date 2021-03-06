# Браузерная игра Тавлеи (Хнефатафл)
Браузерная игра «Викинги онлайн» предназначена для интеллектуального развития и досуга посетителя сайта.<br>
Функциональным назначением программы является предоставление пользователю возможности игры в Тавлеи (Хнефатафл) онлайн с любым другим пользователем в режиме 1 на 1. <br>

В рамках проекта разработаны:<br>
1. Сайт для клиентов с **адаптивной версткой**:
   * главная страница с header и footer;
   * страница с информацией об игре;
   * страница обратной связи. 
2. Игра Тавлеи: 
   * страница меню;
   * страница игрового поля;
   * чат.
# Структура программы игры
Сервер реализует следующие функции:
1. генерация id комнаты;
2. проверка логики игры по правилам "Хнефатафл";
3. обеспечивает пересылку сообщений двух игроков.

Клиент реализует следующие функции:
1. создание комнаты;
2. подключение к комнате;
3. отображение игрового поля и взаимодействие с ним;
4. отображение подсказок на поле.

Архитектура программы игры:<br>
![Структура_игры](https://i.pinimg.com/originals/9b/4f/ac/9b4facd5df535011a4f657e12ab61f87.png)

Структура программы игры: <br>
```
  server.js 
        ┌ 
        │  game-logic.js 
        │  index.html 
        │  /static 
        │  │ ┌
express │  └─│ index.js
        │    │ jquery-3.4.1.min.js
        │    └
        │  /style
        │  │ ┌
        │  │ │ main.css
        │  └─│ bootstrap.js
        │    │ style-game-chat.css
        │    └
        └ 
```
# Структура сайта веб-игры
```
index.html
├─ /page/feedback.html
├─ /page/game.html
└─ /page/rules.html
.htaccess
robots.txt
sitemap.xml
/css/..
/img/..
/php/..
/js/..
```
# Mind-map проекта
Объединяя и анализируя выше приведенные структуры можно выделить следующий план проекта в виде mind-map:<br>
![mindmap](https://i.pinimg.com/originals/b1/d3/57/b1d357b7b5367ceafd566d8fbbceee2f.png "Mind-map проекта")

# Средства разработки
Для разработки сайта выбраны: 
  * HTML v5;
  * CSS v3.0;
  * PHP;
  * Bootstrap v4;
  * Javascript;
  * jQuery v3.4.1;
  * Server: Apache/2.2.24.
  
Для разработки игры выбраны: 
  * Javascript;
  * NodeJS v12.18.1;
  * Express;
  * jQuery v3.4.1;
  * Socket.io.

# Макеты интерфейса пользователя
![Главная_страница](https://i.pinimg.com/originals/13/99/a3/1399a3eff3dabc072782b7d2a12f7168.png "Макет главной страницы")<br>
![Страница_правил](https://i.pinimg.com/originals/b6/47/55/b64755bea243f7fcfbcb5326b5700c81.png "Макет страницы об игре")<br>
![Обратная_связь](https://i.pinimg.com/originals/74/2a/3e/742a3e152add97cd1edf5d78ee3895d4.png "Макет формы обратной связи")<br>
![Игра](https://i.pinimg.com/originals/ae/05/2c/ae052c672cd11fcecfba84f8b7f69987.png "Макет игрового поля")<br>

# Результат и характеристики
Сайт расположен на домене [vikingsgameonline.ru][1] хостинга [hts.ru][2]

Для **сайта** применены следующие технологии реализации:<br>
1. В части *контента*:
    * Определено семантическое ядро 
      * Yandex Wordstat.
      * Google Trends.
    * Выделены ключевые слова 
      * strong.
      ```html
      <h2><strong>Появились вопросы?</strong></h2> 
      ```
      * meta keywords.
      ```html
      <meta name="keywords" content="Викинги, Хнефатафл, Тавлеи, 
                                     играть, онлайн, Vikings, Tavlei, Hnefatafl"/> 
      ```
    * Форматирование заголовков h1 - h6.
    * Оптимизация картинок
      * Разработаны уникальные картинки.
      * Использован тег alt.
      * Использован тег title.
      ```html
      <img src="img/favicon64.png" width="50" height="50" class="d-inline-block align-top " 
           alt="Шлем викинга" title="Логотип Тавлеи Онлайн">
      ```
    * Уникальность текста 100% (https://text.ru/).
2. В части *внешней оптимизации*:
    * Анкорные ссылки с применением ключевых слов.
    * Графические ссылки.
    * Выбран говорящий домен (vikingsgameonline.ru).
3. В части *внутренней оптимизации*:
    * Структура
      * Уровень вложенности страниц не более 2.
      * Дубли страниц устранены с помощью канонических ссылок.
      ```html
      <link rel="canonical" href="https://vikingsgameonline.ru" />
      ```
    * Микроразметка
      * Реализованы текстовые сниппеты.
      * Применен стандарт [schema.org/Game](https://schema.org/Game).
      * Itemscope/itemtype.
      ```html
      <div itemscope itemtype="https://schema.org/Game">
        <span itemprop="name" class="d-none">игра Тавлеи</span>
        <span itemprop="gameLocation" class="d-none">Москва</span>
        <span itemprop="numberOfPlayers" class="d-none">2</span>
        <span itemprop="author" class="d-none">ClanBanan</span>
      </div>
      ```
    * Программная реализация 
      * Юзабилити, реализовано меню (навигация) по сайту.
      * Использован на сайте SSL-сертификат.
      * Оформлен robots.txt.
      * Оформлен sitemap.xml.
      * Наличие кодов ответов сервера 301 и 404.
      * ЧПУ урлы.
      ```
      https://vikingsgameonline.ru/game
      ```
      * Оформлен .htaccess для Apache.
      * Скорость загрузки сайта RUSSIA - 130ms (https://be1.ru/), EUROPE - 840ms (https://www.pingdom.com/). 
      * Валидность кода проверена и исправлена с помощью https://validator.w3.org/.
4. В части *поведенческого фактора*:
    * Проведена интеграция с:
      * Webmaster.
      * Yandex.счетчик.
      * Google.Analytics.
***

Для **игры** расчитаны размер сигналов между сервером и клиентом с помощью кастомного унарного оператора sizeof().<br>
| Сигналы от сервера к клиенту | Объем информации |
|:-----------------------------|:----------------:|
| ping | 20 |
| endGame | 24 |
| updateStep | 26 |
| newGameCreated | 58 |
| fieldChanged | 401 |
| playerJoinedRoom | 600 |

| Сигналы от клиента к серверу | Объем информации |
|:-----------------------------|:----------------:|
| clientPong | 37 |
| clickCell | 50 |
| hostCreateNewGame | 110 |
| playerJoinGame | 146 |

**Итого трафик на клиент: 344 Кбит**<br>
**Итого трафик на сервер: 112 Кбит**<br>

# Поддержка
Если у вас возникли сложности или вопросы, создайте [обсуждение][3] в данном репозитории 
или напишите на электронную почту libese581@gmail.com.

[1]: https://vikingsgameonline.ru
[2]: https://hts.ru
[3]: https://github.com/libra581/ProjectWebsiteTavlei/issues
