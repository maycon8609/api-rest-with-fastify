### List all commands to knex
```shell
npm run knex -- -h
```

### Create a new migration
```shell
npm run knex -- migrate:make <migrate name>
```

### Run all migrations
```shell
npm run knex -- migrate:latest
```

### Revert all migrations
```shell
npm run knex -- migrate:rollback
```