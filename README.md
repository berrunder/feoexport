# Экспорт справочников для МОН
Утилита для экспорта справочников ФЭО из базы talisman-sql.

## Установка
Установить [Node.js](http://nodejs.org). Далее выполнить в папке проекта команду `npm install`.

## Настройка
Файл конфигурации находится по пути `config/config.json`. Ветка `tsqlDB` - параметры подключения к базе. Пример:

    "tsqlDB": {
        "host": "192.168.1.250",
        "database": "/vol1/talisman_sql/BASES/TEST/Cherkashin/TSQL.GDB",
        "user": "DBADMIN",
        "password": "cnhfiysq"
    }
   
`lastDate` - выгружаются только пакеты, указанные с этой даты. Формат DD.MM.YYYY.


## Использование
`node index.js [json|sql]` - выгрузка справочников в json либо sql файл (по умолчанию json). После выгрузки будет создан файл с именем формата `exportYYYYMMDD_HHmmss` и соответствующим выгружаемому формату расширением.
