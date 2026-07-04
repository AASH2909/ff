# ADR-006: Copilot Dependency Boundary

**Дата:** 03.07.2026

**Статус:** Accepted

---

## Контекст

Copilot является верхним интеллектуальным слоем CONTROL OS.

Он предназначен для ответа на управленческие вопросы:

- что происходит;
- почему это произошло;
- что будет дальше;
- что лучше сделать сейчас.

Для этого Copilot использует уже подготовленные интеллектуальные слои платформы.

---

## Решение

Copilot не должен обращаться напрямую к низкоуровневым bounded context, инфраструктуре или сырым таблицам базы данных.

Copilot должен получать данные только через утверждённые интеллектуальные источники.

Разрешённые источники:

- Analytics Context
- Predictive Analytics
- Executive Timeline
- Decision Intelligence

---

## Запрещённые зависимости

Copilot не должен напрямую зависеть от:

- Dashboard repositories
- Fraud repositories
- Notification repositories
- Audit repositories
- Supabase repositories других модулей
- raw database tables
- Event Bus payloads
- внешних API без адаптера

---

## Правильная зависимость

```text
Copilot
  -> Copilot Context Provider
    -> Analytics Context
    -> Predictions
    -> Timeline
    -> Decision Scenarios