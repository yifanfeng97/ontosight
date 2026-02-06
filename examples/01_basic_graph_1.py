"""游戏实体关系可视化示例.

This example demonstrates how to visualize game entity relationships with nodes and edges.
"""
from typing import Dict, Any
from ontosight.core import view_graph
from pydantic import BaseModel, Field


class GameEntity(BaseModel):
    """游戏实体节点（包含玩家、BOSS、NPC、公会等）"""

    name: str = Field(description="实体名称或ID，例如玩家ID、BOSS名、'星辰阁'")
    category: str = Field(
        description="实体类型，例如：'玩家', 'BOSS', '公会', '群体'", default="玩家"
    )
    info: str = Field(description="职业、描述或状态，如'战神'、'最终BOSS'、'解散'", default="未知")

    def __repr__(self):
        return f"🎮 [{self.category}] {self.name} <{self.info}>"


class GameInteraction(BaseModel):
    """游戏互动边"""

    source: str = Field(description="发起互动的实体名称")
    target: str = Field(description="互动的对象名称（可以是玩家、BOSS或公会）")
    action_type: str = Field(
        description="互动类型：'治疗', '攻击', '抢装备', '辱骂', '踢出队伍', '拉入队伍'"
    )
    details: str = Field(description="具体的互动描述或原因")

    def __repr__(self):
        return f"⚡ {self.source} --[{self.action_type}]--> {self.target} ({self.details})"


# 定义节点数据
nodes = [
    GameEntity(name="雷霆之怒", category="玩家", info="会长兼主坦克，40级战士，装备评分9999"),
    GameEntity(name="坚如磐石", category="玩家", info="副坦克，38级盾战士，评分8800，人很老实"),
    GameEntity(
        name="小甜甜",
        category="玩家",
        info="主奶妈（治疗），副奶妈，38级圣骑士，评分8600，公会成员",
    ),
    GameEntity(name="月光治愈者", category="玩家", info="副奶妈，35级德鲁伊，评分7500"),
    GameEntity(
        name="暗影刺客", category="玩家", info="DPS输出1（弓箭手），39级猎手，评分9200，关键角色"
    ),
    GameEntity(name="火球术一级", category="玩家", info="DPS输出2（法师），37级法师，评分8400"),
    GameEntity(name="风云剑侠", category="玩家", info="DPS输出3（剑客），36级剑士，评分7800"),
    GameEntity(name="冰霜法咒", category="玩家", info="远程法师，35级冰法，评分7600"),
    GameEntity(name="星辰阁", category="公会", info="蕴含感情"),
    GameEntity(name="深渊魔龙", category="BOSS", info="最终BOSS"),
    GameEntity(name="全团", category="群体", info="组队或团体"),
    GameEntity(name="匿名玩家（ID已隐藏）", category="玩家", info="游戏玩家"),
    GameEntity(name="日月神教", category="公会", info="新公会"),
    GameEntity(name="游戏管理员001", category="管理员", info="官方帐号"),
    GameEntity(name="魔龙之牙", category="物品", info="传说级别的武器"),
    GameEntity(name="装备交易商", category="玩家", info="装备交易商"),
    GameEntity(name="游戏社区版主", category="玩家", info="游戏社区版主"),
    GameEntity(name="相关玩家", category="群体", info="关键玩家"),
]

# 定义边数据
edges = [
    GameInteraction(
        source="匿名玩家（ID已隐藏）",
        target="星辰阁",
        action_type="爆料",
        details="星辰阁解散真相爆料",
    ),
    GameInteraction(
        source="雷霆之怒",
        target="小甜甜",
        action_type="责骂",
        details="雷霆之怒在公会语音频道中责骂小甜甜未能及时治疗坦克，并决定踢出小甜甜和暗影刺客",
    ),
    GameInteraction(
        source="雷霆之怒",
        target="暗影刺客",
        action_type="踢出队伍",
        details="雷霆之怒在YY频道中批评暗影刺客并决定踢出小甜甜和暗影刺客",
    ),
    GameInteraction(
        source="暗影刺客",
        target="魔龙之牙",
        action_type="拾取",
        details="暗影刺客获得传说级武器“魔龙之牙”并拾取稀有掉落物品",
    ),
    GameInteraction(
        source="小甜甜", target="暗影刺客", action_type="治疗", details="小甜甜表现出治疗偏倚"
    ),
    GameInteraction(
        source="雷霆之怒",
        target="暗影刺客",
        action_type="踢出公会",
        details="雷霆之怒决定将暗影刺客踢出星辰阁。",
    ),
    GameInteraction(
        source="雷霆之怒",
        target="小甜甜",
        action_type="踢出公会",
        details="雷霆之怒决定将小甜甜踢出星辰阁。",
    ),
    GameInteraction(
        source="暗影刺客",
        target="魔龙之牙",
        action_type="抢装备",
        details="暗影刺客抢夺已掉落的'魔龙之牙'并放入背包。",
    ),
    GameInteraction(
        source="雷霆之怒",
        target="暗影刺客",
        action_type="举报",
        details="雷霆之怒在世界频道举报暗影刺客图谋不轨，贪图装备。",
    ),
    GameInteraction(
        source="雷霆之怒",
        target="小甜甜",
        action_type="举报",
        details="雷霆之怒同时在世界频道举报小甜甜合谋黑装备。",
    ),
    GameInteraction(
        source="火球术一级",
        target="暗影刺客",
        action_type="举报",
        details="火球术一级在世界频道支持对暗影刺客的举报。",
    ),
    GameInteraction(
        source="小甜甜",
        target="小甜甜",
        action_type="退出公会",
        details="小甜甜在未辩解的情况下直接退出星辰阁。",
    ),
    GameInteraction(
        source="暗影刺客",
        target="暗影刺客",
        action_type="退出公会",
        details="暗影刺客宣布退出星辰阁并开始反击。",
    ),
    GameInteraction(
        source="游戏管理员001",
        target="暗影刺客",
        action_type="调查",
        details="游戏管理员001回应将在调查暗影刺客的违规行为。",
    ),
    GameInteraction(
        source="雷霆之怒",
        target="星辰阁",
        action_type="解散公会",
        details="雷霆之怒宣布星辰阁正式解散，计划转移到小公会。",
    ),
    GameInteraction(
        source="火球术一级",
        target="冰霜法咒",
        action_type="怀疑",
        details="火球术一级在世界频道怀疑冰霜法咒的行为。",
    ),
    GameInteraction(
        source="风云剑侠",
        target="雷霆之怒",
        action_type="加入公会",
        details="风云剑侠申请加入日月神教，离开星辰阁。",
    ),
    GameInteraction(
        source="月光治愈者",
        target="相关玩家",
        action_type="辩解",
        details="为昨晚的治疗过程中没有划水行为辩解",
    ),
    GameInteraction(
        source="月光治愈者",
        target="小甜甜",
        action_type="批评",
        details="批评小甜甜的治疗分配有问题",
    ),
    GameInteraction(
        source="月光治愈者", target="星辰阁", action_type="情感表达", details="对公会星辰阁有感情"
    ),
    GameInteraction(
        source="装备交易商",
        target="游戏社区版主",
        action_type="建议",
        details="推荐官方加强对装备分配的监管",
    ),
    GameInteraction(
        source="游戏社区版主",
        target="相关玩家",
        action_type="提醒",
        details="提醒相关玩家可以选择转服",
    ),
]



# Define search callback
def on_search(query: str) -> list:
    """Handle search queries - return matching node IDs."""
    print(f"[Search] Query: {query}")

    results = []
    for node in nodes:
        # Search in label, department, level
        if (
            query.lower() in node.name.lower()
            or query.lower() in node.category.lower()
            or query.lower() in node.info.lower()
        ):
            results.append(node)

    print(f"[Search] Found {len(results)} results: {results}")
    return results, []


if __name__ == "__main__":
    # 创建游戏实体关系可视化
    view_graph(
        node_list=nodes,
        edge_list=edges,
        node_schema=GameEntity,
        edge_schema=GameInteraction,
        node_id_extractor=lambda node: node.name,
        node_ids_in_edge_extractor=lambda edge: (edge.source, edge.target),
        edge_label_extractor=lambda edge: edge.action_type,
        node_label_extractor=lambda node: node.name,
        on_search=on_search,
    )
