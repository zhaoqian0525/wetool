/**
 * 内置工具 UUID 映射
 *
 * 内置工具（MOCK_TOOLS，前端 id 为 "1".."18"）在云端表
 * tool_state / tool_usage_history / tool_recent 中的 tool_id 列是 UUID 类型，
 * 直接写入字符串 id 会报 "invalid input syntax for type uuid"，导致：
 *   - 登录用户的内置工具状态无法保存/恢复（退出后记忆失效）
 *   - 使用记录、最近使用写不进去
 * 这里为每个内置工具固定映射一个稳定的 UUID（这些表与 tools 无外键依赖），
 * 数据库读写时统一用 toDbToolId 换算，展示时用 fromDbToolId 还原。
 * 用户发布的工具本身是 UUID，原样透传。
 */

const BUILTIN_UUID_MAP: Record<string, string> = {
  "1": "68089a5c-7b6e-52de-8b05-2c21a6019b0b",
  "2": "1ec769f8-c637-56a6-93b3-edfab0de66f7",
  "3": "30f80a9f-84a9-5927-94bd-fd6f5176bfac",
  "4": "fd10ce1c-303e-5df9-af81-d27f32db1310",
  "5": "567cea14-637d-5079-94ec-fdd4a3659b42",
  "6": "1543b0b5-e7e7-56ee-a47c-72d454793da3",
  "7": "ea660fda-02e9-5a41-81a5-9bb2220e345e",
  "8": "e6739193-39ca-5920-8a92-0ae0fdb161cb",
  "9": "ecbf8f47-92c5-545c-a0e8-1803ffa57517",
  "10": "741c35cc-8642-52e9-b960-3347b419a69f",
  "11": "4537b528-1038-5b56-973f-d86ab7a76eee",
  "12": "b42114ef-23ad-5af9-82df-20d3fa6c2364",
  "13": "449d5e87-711b-5ba0-a4d2-9261912320a5",
  "14": "ebd55c31-fea1-5bf1-b656-fa3821d3be94",
  "15": "a31b8190-e33e-594e-9cea-d7bb0fb1d33b",
  "16": "6d200cb6-25e9-511a-ab95-d819c281c062",
  "17": "9d483008-991d-58b9-a614-e76141e68cb8",
  "18": "f986f51e-e2f9-5db2-8e97-8020c6ad621d",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

/** 前端工具 id → 数据库 tool_id（内置工具换算为稳定 UUID，其余原样透传） */
export function toDbToolId(toolId: string): string {
  if (!toolId) return toolId;
  if (isUuid(toolId)) return toolId;
  return BUILTIN_UUID_MAP[toolId] ?? toolId;
}

/** 数据库 tool_id → 前端工具 id（内置工具的 UUID 还原为 "1".."18"，其余返回 null） */
export function fromDbToolId(dbId: string): string | null {
  if (!dbId) return null;
  return Object.keys(BUILTIN_UUID_MAP).find((k) => BUILTIN_UUID_MAP[k] === dbId) ?? null;
}