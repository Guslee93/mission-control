# CloudBot Control

Direct integration endpoint allowing CloudBot to push real-time updates to Mission Control without redeploys.

## How It Works
1. CloudBot writes to workspace files directly (`.mission-control/`)
2. Next.js API route `/api/cloudbot` receives webhooks/commands
3. Changes reflect immediately in UI via SWR/React Query revalidation

## Endpoints

### POST /api/cloudbot
Authenticated endpoint for CloudBot commands.

**Headers:**
```
Authorization: Bearer <CLOUDBOT_API_KEY>
```

**Actions:**

#### Add Task
```json
{
  "action": "add_task",
  "data": {
    "title": "Task name",
    "description": "Details",
    "priority": "high|medium|low",
    "assignedTo": "agent-id",
    "dueDate": "2025-03-10"
  }
}
```

#### Create Agent
```json
{
  "action": "create_agent",
  "data": {
    "id": "agent-name",
    "name": "Agent Name",
    "role": "Role description",
    "tags": ["tag1", "tag2"],
    "color": "#hexcolor"
  }
}
```

#### Update Agent Status
```json
{
  "action": "update_agent_status",
  "data": {
    "agentId": "agent-name",
    "status": "online|standby|offline"
  }
}
```

#### Spawn Agent
```json
{
  "action": "spawn_agent",
  "data": {
    "agentId": "agent-name",
    "task": "What the agent should do"
  }
}
```

## Authentication
API key stored in environment: `CLOUDBOT_API_KEY`

## File Structure
- Commands modify `.mission-control/*.json` directly
- Frontend polls or uses SWR for real-time updates
- WebSocket optional for instant push notifications
