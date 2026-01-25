
# Team mini project

## Database Schema (Lost & Found System)

### Users Table
- id (primary key)
- name
- email (unique)
- password (hashed)
- role (user/admin)

### Posts Table
- id (primary key)
- user_id (foreign key → users.id)
- type (lost/found)
- category
- item_name
- description
- location
- image_url
- date_reported
- approval_status (pending/approved)
- match_status (matched/unmatched)
- match_score (0–100)
- matched_item_id (foreign key → posts.id)
- created_at

### Admin Approval Logic
- All items are stored with approval_status = 'pending'
- Admin reviews matched and unmatched items
- Approved items become visible to users
- Matching is handled using match_status and match_score

