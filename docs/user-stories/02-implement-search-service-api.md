# Implement search service API

Label: new

As a neighbor, I need to search by name, category, condition, and age so that I can narrow the collection to items that fit my needs.

## Acceptance criteria
- The search endpoint supports partial, case-insensitive name matches.
- Category and condition filters can be combined with an age limit.
- A search with no matches returns an empty JSON array.
- Search text is treated as a literal value rather than an executable regular expression.