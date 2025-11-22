export type Language = 'zh' | 'en';

export interface Translations {
  // App
  app: {
    title: string;
    subtitle: string;
  };
  // Header
  header: {
    spiritStones: string;
    continue: string;
    pause: string;
    save: string;
    load: string;
    language: string;
  };
  // Settings
  settings: {
    title: string;
    gameSpeed: string;
    language: string;
    help: string;
    saveGame: string;
    loadGame: string;
    close: string;
  };
  // Tabs
  tabs: {
    cultivation: string;
    market: string;
    inventory: string;
    combat: string;
    skills: string;
  };
  // Character Panel
  character: {
    cultivationProgress: string;
    attemptBreakthrough: string;
    attributes: string;
    currentActivity: string;
    cultivationEfficiency: string;
    stage: string;
  };
  // Stats
  stats: {
    hp: string;
    spiritualPower: string;
    divineSense: string;
    comprehension: string;
    luck: string;
    speed: string;
    attack: string;
    defense: string;
  };
  // Activities
  activities: {
    closedDoor: {
      name: string;
      description: string;
    };
    marketStation: {
      name: string;
      description: string;
    };
    travel: {
      name: string;
      description: string;
    };
    idle: {
      name: string;
      description: string;
    };
  };
  // Market
  market: {
    title: string;
    quantity: string;
    inventory: string;
    marketStock: string;
    basePrice: string;
    buy: string;
    sell: string;
    total: string;
  };
  // Inventory
  inventory: {
    title: string;
    empty: string;
    spiritMaterials: string;
    pills: string;
    talismans: string;
    artifacts: string;
    quantity: string;
  };
  // Combat
  combat: {
    title: string;
    comingSoon: string;
    description: string;
    round: string;
    yourTurn: string;
    enemyTurn: string;
    victory: string;
    defeat: string;
    fled: string;
    attack: string;
    defend: string;
    observe: string;
    flee: string;
    skills: string;
    items: string;
    collectRewards: string;
    rewards: string;
  };
  // Log
  log: {
    title: string;
    empty: string;
  };
  // Realms
  realms: {
    qiRefining: string;
    foundation: string;
    coreFormation: string;
    nascentSoul: string;
    spiritTransformation: string;
    voidRefining: string;
    bodyIntegration: string;
    mahayana: string;
    tribulation: string;
  };
  // Stages
  stages: {
    early: string;
    mid: string;
    late: string;
    peak: string;
    layer: string;
  };
  // Time
  time: {
    year: string;
    month: string;
    day: string;
    ke: string;
  };
  // Messages
  messages: {
    gameStarted: string;
    breakthroughSuccess: string;
    breakthroughFailed: string;
    activityChanged: string;
    cultivationGain: string;
    bought: string;
    sold: string;
  };
  // Skill Trees
  skillTree: {
    title: string;
    skillPoints: string;
    wudaoPoints: string;
    learned: string;
    learn: string;
    reset: string;
    resetConfirm: string;
    refund: string;
    requires: string;
    cost: string;
    tier: string;
    mainTrees: string;
    elementTrees: string;
    primary: string;
    secondary: string;
    locked: string;
    maxTier: string;
    trees: {
      sword: string;
      spell: string;
      body: string;
      mind: string;
      commerce: string;
    };
    elements: {
      fire: string;
      water: string;
      wood: string;
      metal: string;
      earth: string;
    };
    nodeTypes: {
      passive: string;
      active: string;
    };
    available: string;
    clickNodeToView: string;
    statBonuses: string;
    unlocksSkill: string;
    resetTitle: string;
    confirmReset: string;
  };
  // Talent System
  talent: {
    title: string;
    majorTalents: string;
    minorTalents: string;
    flaws: string;
    innateDestiny: string;
    acquiredInsight: string;
    shadowFlaw: string;
    fateChange: string;
    fateChangeCost: string;
    fateChangeCount: string;
    fateChangeDescription: string;
    selectDestiny: string;
    selectDestinyDescription: string;
    breakthroughInsight: string;
    breakthroughDescription: string;
    confirmSelection: string;
    gainInsight: string;
    skipForNow: string;
    currentBonuses: string;
    noBonuses: string;
    noTalents: string;
    scopes: {
      battle: string;
      market: string;
      cultivation: string;
      spirit_beast: string;
      world_event: string;
    };
    categories: {
      combat: string;
      cultivation: string;
      market: string;
      beast: string;
    };
    bonuses: {
      damageBonus: string;
      swordDamage: string;
      damageReduction: string;
      critRate: string;
      critDamage: string;
      hpBonus: string;
      qiCap: string;
      executeDamage: string;
      lowHpShield: string;
      cultivationExp: string;
      combatExp: string;
      idleExp: string;
      breakthrough: string;
      priceInsight: string;
      tradeProfit: string;
      stockpileBonus: string;
      assetExp: string;
      captureRate: string;
      affinityCap: string;
      encounterRate: string;
      moodBoost: string;
      trainingExp: string;
      battleBond: string;
    };
  };
  // Spirit Beast System
  spiritBeast: {
    title: string;
    collection: string;
    empty: string;
    details: string;
    stats: string;
    skills: string;
    traits: string;
    level: string;
    exp: string;
    tier: string;
    rarity: string;
    element: string;
    role: string;
    personality: string;
    mood: string;
    affinity: string;
    feed: string;
    train: string;
    setActive: string;
    removeActive: string;
    breakthrough: string;
    capture: string;
    release: string;
    battleMode: string;
    tiers: {
      mortal: string;
      spirit: string;
      mystic: string;
      holy: string;
    };
    roles: {
      attacker: string;
      supporter: string;
      tank: string;
      gatherer: string;
      hybrid: string;
    };
    personalities: {
      aggressive: string;
      calm: string;
      agile: string;
      wise: string;
      lucky: string;
    };
    moods: {
      happy: string;
      calm: string;
      anxious: string;
      fearful: string;
      sick: string;
    };
    battleModes: {
      accompanying: string;
      summoned: string;
      support: string;
    };
    messages: {
      fed: string;
      trained: string;
      levelUp: string;
      breakthrough: string;
      breakthroughFailed: string;
      setActive: string;
      removed: string;
      noSpace: string;
      captured: string;
      captureFailed: string;
      newSkill: string;
    };
  };
  // Help Modal
  help: {
    title: string;
    realms: {
      title: string;
      items: string[];
    };
    tips: {
      title: string;
      items: string[];
    };
    market: {
      title: string;
      items: string[];
    };
    attributes: {
      title: string;
      items: string[];
    };
  };
  // Log Types
  logTypes: {
    cultivation: string;
    market: string;
    combat: string;
    event: string;
    system: string;
    all: string;
  };
  // Common UI
  common: {
    minimize: string;
    global: string;
    switchTo: string;
    currentLanguage: string;
    otherLanguage: string;
    otherStats: string;
    cancel: string;
    confirm: string;
    noItems: string;
    clickToView: string;
    defending: string;
    insight: string;
    rewards: string;
    return: string;
    enemyActing: string;
    noCombatItems: string;
    noFeedItems: string;
  };
}

export const translations: Record<Language, Translations> = {
  zh: {
    app: {
      title: '修仙模拟器',
      subtitle: 'Cultivation Simulator',
    },
    header: {
      spiritStones: '灵石',
      continue: '继续',
      pause: '暂停',
      save: '存档',
      load: '读档',
      language: '语言',
    },
    settings: {
      title: '设置',
      gameSpeed: '游戏速度',
      language: '语言切换',
      help: '帮助',
      saveGame: '保存游戏',
      loadGame: '读取存档',
      close: '关闭',
    },
    tabs: {
      cultivation: '修炼',
      market: '坊市',
      inventory: '储物',
      combat: '战斗',
      skills: '功法',
    },
    character: {
      cultivationProgress: '修为进度',
      attemptBreakthrough: '尝试突破',
      attributes: '属性',
      currentActivity: '当前活动',
      cultivationEfficiency: '修炼效率',
      stage: '第{n}层',
    },
    stats: {
      hp: '生命',
      spiritualPower: '灵力',
      divineSense: '神识',
      comprehension: '悟性',
      luck: '气运',
      speed: '速度',
      attack: '攻击',
      defense: '防御',
    },
    activities: {
      closedDoor: {
        name: '闭关修炼',
        description: '专心修炼，进展更快但无法交易或冒险。',
      },
      marketStation: {
        name: '驻守坊市',
        description: '在坊市驻守，修炼较慢但可进行交易。',
      },
      travel: {
        name: '游历',
        description: '周游世界，可能触发奇遇、发现宝藏或隐秘市场。',
      },
      idle: {
        name: '休息',
        description: '休息恢复，修炼进展极慢。',
      },
    },
    market: {
      title: '坊市',
      quantity: '交易数量',
      inventory: '库存',
      marketStock: '市场',
      basePrice: '基准价',
      buy: '购买',
      sell: '出售',
      total: '共计',
    },
    inventory: {
      title: '储物袋',
      empty: '储物袋空空如也...',
      spiritMaterials: '灵材',
      pills: '丹药',
      talismans: '符箓',
      artifacts: '法器',
      quantity: '数量',
    },
    combat: {
      title: '战斗',
      comingSoon: '即将开放',
      description: '战斗系统正在开发中，敬请期待秘境探险、宗门大比等精彩内容！',
      round: '回合',
      yourTurn: '你的回合',
      enemyTurn: '敌人回合',
      victory: '胜利!',
      defeat: '战败...',
      fled: '逃跑成功',
      attack: '攻击',
      defend: '防御',
      observe: '观察',
      flee: '逃跑',
      skills: '技能',
      items: '物品',
      collectRewards: '收取奖励',
      rewards: '获得奖励',
    },
    log: {
      title: '修炼日志',
      empty: '暂无日志...',
    },
    realms: {
      qiRefining: '炼气期',
      foundation: '筑基期',
      coreFormation: '结丹期',
      nascentSoul: '元婴期',
      spiritTransformation: '化神期',
      voidRefining: '炼虚期',
      bodyIntegration: '合体期',
      mahayana: '大乘期',
      tribulation: '渡劫期',
    },
    stages: {
      early: '初期',
      mid: '中期',
      late: '后期',
      peak: '巅峰',
      layer: '{realm}第{n}层',
    },
    time: {
      year: '年',
      month: '月',
      day: '日',
      ke: '刻',
    },
    messages: {
      gameStarted: '你踏上了修仙之路...',
      breakthroughSuccess: '突破成功！境界提升至{realm}',
      breakthroughFailed: '突破失败，继续努力修炼吧',
      activityChanged: '切换活动为：{activity}',
      cultivationGain: '修炼获得 {value} 修为',
      bought: '购买了 {quantity} 个{item}，花费 {cost} 灵石',
      sold: '出售了 {quantity} 个{item}，获得 {revenue} 灵石',
    },
    skillTree: {
      title: '功法天赋',
      skillPoints: '技能点',
      wudaoPoints: '悟道点',
      learned: '已学习',
      learn: '学习',
      reset: '重置',
      resetConfirm: '确定要重置吗？将退还80%的悟道点。',
      refund: '退还',
      requires: '需要',
      cost: '消耗',
      tier: '阶',
      mainTrees: '功法树',
      elementTrees: '元素树',
      primary: '主修',
      secondary: '副修',
      locked: '锁定',
      maxTier: '最高阶',
      trees: {
        sword: '剑道',
        spell: '法术',
        body: '身法',
        mind: '心法',
        commerce: '商道',
      },
      elements: {
        fire: '火',
        water: '水',
        wood: '木',
        metal: '金',
        earth: '土',
      },
      nodeTypes: {
        passive: '被动',
        active: '主动',
      },
      available: '可学习',
      clickNodeToView: '点击节点查看详情',
      statBonuses: '属性加成',
      unlocksSkill: '解锁技能',
      resetTitle: '重置技能树',
      confirmReset: '确定重置',
    },
    talent: {
      title: '天赋系统',
      majorTalents: '先天气运',
      minorTalents: '后天悟性',
      flaws: '阴影缺陷',
      innateDestiny: '先天气运',
      acquiredInsight: '后天悟性',
      shadowFlaw: '阴影缺陷',
      fateChange: '改命',
      fateChangeCost: '费用',
      fateChangeCount: '改命次数',
      fateChangeDescription: '消耗灵石更换天赋，每次费用翻倍。',
      selectDestiny: '选择你的命运',
      selectDestinyDescription: '每个命运组合包含一个先天气运和一个后天悟性，部分还有缺陷。',
      breakthroughInsight: '突破感悟',
      breakthroughDescription: '成功突破！你的经历让你获得了新的领悟。',
      confirmSelection: '确认选择',
      gainInsight: '获得领悟',
      skipForNow: '暂时跳过',
      currentBonuses: '当前加成',
      noBonuses: '暂无加成效果',
      noTalents: '尚未选择天赋，开始新游戏时选择',
      scopes: {
        battle: '战斗',
        market: '商业',
        cultivation: '修炼',
        spirit_beast: '灵兽',
        world_event: '世界事件',
      },
      categories: {
        combat: '战斗',
        cultivation: '修炼',
        market: '商业',
        beast: '灵兽',
      },
      bonuses: {
        damageBonus: '伤害加成',
        swordDamage: '剑系伤害',
        damageReduction: '伤害减免',
        critRate: '暴击率',
        critDamage: '暴击伤害',
        hpBonus: '生命加成',
        qiCap: '气上限',
        executeDamage: '处决伤害',
        lowHpShield: '低血护盾',
        cultivationExp: '修炼效率',
        combatExp: '战斗修为',
        idleExp: '闭关修炼',
        breakthrough: '突破加成',
        priceInsight: '价格洞察',
        tradeProfit: '交易利润',
        stockpileBonus: '囤货加成',
        assetExp: '资产转修为',
        captureRate: '捕获率',
        affinityCap: '亲密上限',
        encounterRate: '遭遇率',
        moodBoost: '心情提升',
        trainingExp: '训练经验',
        battleBond: '共战伤害',
      },
    },
    spiritBeast: {
      title: '灵兽',
      collection: '灵兽收藏',
      empty: '暂无灵兽，去野外捕捉吧！',
      details: '详细信息',
      stats: '属性',
      skills: '技能',
      traits: '特性',
      level: '等级',
      exp: '经验',
      tier: '品阶',
      rarity: '稀有度',
      element: '属性',
      role: '定位',
      personality: '性格',
      mood: '心情',
      affinity: '亲密度',
      feed: '喂养',
      train: '训练',
      setActive: '设为出战',
      removeActive: '取消出战',
      breakthrough: '突破',
      capture: '捕捉',
      release: '放生',
      battleMode: '出战模式',
      tiers: {
        mortal: '凡兽',
        spirit: '灵兽',
        mystic: '玄兽',
        holy: '圣兽',
      },
      roles: {
        attacker: '输出型',
        supporter: '辅助型',
        tank: '坦克型',
        gatherer: '采集型',
        hybrid: '混合型',
      },
      personalities: {
        aggressive: '暴躁',
        calm: '稳重',
        agile: '灵动',
        wise: '睿智',
        lucky: '福缘',
      },
      moods: {
        happy: '快乐',
        calm: '平静',
        anxious: '焦躁',
        fearful: '恐惧',
        sick: '生病',
      },
      battleModes: {
        accompanying: '随行出战',
        summoned: '召唤出战',
        support: '辅助出战',
      },
      messages: {
        fed: '喂养了{name}，获得{exp}经验，亲密度+{affinity}',
        trained: '训练了{name}，获得{exp}经验',
        levelUp: '{name}升级了！当前等级：{level}',
        breakthrough: '{name}突破成功！晋升为{tier}',
        breakthroughFailed: '突破失败，继续努力！',
        setActive: '{name}已设为出战灵兽',
        removed: '{name}已取消出战',
        noSpace: '灵兽栏位已满',
        captured: '成功捕获了{name}！',
        captureFailed: '捕捉失败，{name}逃跑了',
        newSkill: '{name}学会了新技能：{skill}',
      },
    },
    help: {
      title: '修炼指南',
      realms: {
        title: '境界体系',
        items: [
          '炼气期（9层）',
          '筑基期（4阶段）',
          '结丹期（4阶段）',
          '元婴期（4阶段）',
          '化神期',
          '……',
        ],
      },
      tips: {
        title: '修炼技巧',
        items: [
          '闭关修炼：最快提升修为',
          '驻守坊市：可以交易物品',
          '游历：可能遇到机缘或危险',
          '修为满时可尝试突破',
        ],
      },
      market: {
        title: '市场交易',
        items: [
          '价格随时间波动',
          '大量买入会推高价格',
          '大量卖出会压低价格',
          '关注世界事件影响',
        ],
      },
      attributes: {
        title: '属性说明',
        items: [
          '悟性：影响修炼速度',
          '气运：影响突破成功率',
          '神识：影响战斗准确度',
          '速度：影响战斗顺序',
        ],
      },
    },
    logTypes: {
      cultivation: '修炼',
      market: '交易',
      combat: '战斗',
      event: '事件',
      system: '系统',
      all: '全部',
    },
    common: {
      minimize: '最小化',
      global: '全局',
      switchTo: '切换到',
      currentLanguage: '中文',
      otherLanguage: 'EN',
      otherStats: '其他属性',
      cancel: '取消',
      confirm: '确定',
      noItems: '没有可用物品',
      clickToView: '点击查看详情',
      defending: '防御中',
      insight: '洞察',
      rewards: '获得奖励',
      return: '返回',
      enemyActing: '敌人行动中...',
      noCombatItems: '没有可用的战斗物品',
      noFeedItems: '没有可用的喂养物品',
    },
  },
  en: {
    app: {
      title: 'Cultivation Simulator',
      subtitle: 'Xiuxian',
    },
    header: {
      spiritStones: 'Spirit Stones',
      continue: 'Continue',
      pause: 'Pause',
      save: 'Save',
      load: 'Load',
      language: 'Language',
    },
    settings: {
      title: 'Settings',
      gameSpeed: 'Game Speed',
      language: 'Language',
      help: 'Help',
      saveGame: 'Save Game',
      loadGame: 'Load Game',
      close: 'Close',
    },
    tabs: {
      cultivation: 'Cultivation',
      market: 'Market',
      inventory: 'Inventory',
      combat: 'Combat',
      skills: 'Skills',
    },
    character: {
      cultivationProgress: 'Cultivation Progress',
      attemptBreakthrough: 'Attempt Breakthrough',
      attributes: 'Attributes',
      currentActivity: 'Current Activity',
      cultivationEfficiency: 'Cultivation Efficiency',
      stage: 'Stage {n}',
    },
    stats: {
      hp: 'HP',
      spiritualPower: 'Spiritual Power',
      divineSense: 'Divine Sense',
      comprehension: 'Comprehension',
      luck: 'Luck',
      speed: 'Speed',
      attack: 'Attack',
      defense: 'Defense',
    },
    activities: {
      closedDoor: {
        name: 'Closed-Door Cultivation',
        description: 'Focus entirely on cultivation. Faster progress but no trading or adventures.',
      },
      marketStation: {
        name: 'Station at Market',
        description: 'Stay at the market to trade. Slower cultivation but can execute trading strategies.',
      },
      travel: {
        name: 'Travel & Adventure',
        description: 'Travel the world. May trigger encounters, find hidden treasures, or discover secret markets.',
      },
      idle: {
        name: 'Rest',
        description: 'Rest and recover. Minimal cultivation progress.',
      },
    },
    market: {
      title: 'Market',
      quantity: 'Quantity',
      inventory: 'Inventory',
      marketStock: 'Market',
      basePrice: 'Base Price',
      buy: 'Buy',
      sell: 'Sell',
      total: 'Total',
    },
    inventory: {
      title: 'Inventory',
      empty: 'Your inventory is empty...',
      spiritMaterials: 'Spirit Materials',
      pills: 'Pills',
      talismans: 'Talismans',
      artifacts: 'Artifacts',
      quantity: 'Qty',
    },
    combat: {
      title: 'Combat',
      comingSoon: 'Coming Soon',
      description: 'Combat system is under development. Look forward to secret realm exploration, sect competitions, and more!',
      round: 'Round',
      yourTurn: 'Your Turn',
      enemyTurn: 'Enemy Turn',
      victory: 'Victory!',
      defeat: 'Defeat...',
      fled: 'Escaped',
      attack: 'Attack',
      defend: 'Defend',
      observe: 'Observe',
      flee: 'Flee',
      skills: 'Skills',
      items: 'Items',
      collectRewards: 'Collect Rewards',
      rewards: 'Rewards',
    },
    log: {
      title: 'Cultivation Log',
      empty: 'No logs yet...',
    },
    realms: {
      qiRefining: 'Qi Refining',
      foundation: 'Foundation',
      coreFormation: 'Core Formation',
      nascentSoul: 'Nascent Soul',
      spiritTransformation: 'Spirit Transformation',
      voidRefining: 'Void Refining',
      bodyIntegration: 'Body Integration',
      mahayana: 'Mahayana',
      tribulation: 'Tribulation',
    },
    stages: {
      early: 'Early',
      mid: 'Mid',
      late: 'Late',
      peak: 'Peak',
      layer: '{realm} Layer {n}',
    },
    time: {
      year: 'Year',
      month: 'Month',
      day: 'Day',
      ke: 'Ke',
    },
    messages: {
      gameStarted: 'You have embarked on the path of cultivation...',
      breakthroughSuccess: 'Breakthrough successful! Advanced to {realm}',
      breakthroughFailed: 'Breakthrough failed. Keep cultivating!',
      activityChanged: 'Activity changed to: {activity}',
      cultivationGain: 'Gained {value} cultivation',
      bought: 'Bought {quantity} {item} for {cost} spirit stones',
      sold: 'Sold {quantity} {item} for {revenue} spirit stones',
    },
    skillTree: {
      title: 'Skill Trees',
      skillPoints: 'Skill Points',
      wudaoPoints: 'Dao Points',
      learned: 'Learned',
      learn: 'Learn',
      reset: 'Reset',
      resetConfirm: 'Are you sure? You will receive 80% refund.',
      refund: 'Refund',
      requires: 'Requires',
      cost: 'Cost',
      tier: 'Tier',
      mainTrees: 'Main Trees',
      elementTrees: 'Element Trees',
      primary: 'Primary',
      secondary: 'Secondary',
      locked: 'Locked',
      maxTier: 'Max Tier',
      trees: {
        sword: 'Sword',
        spell: 'Spell',
        body: 'Body',
        mind: 'Mind',
        commerce: 'Commerce',
      },
      elements: {
        fire: 'Fire',
        water: 'Water',
        wood: 'Wood',
        metal: 'Metal',
        earth: 'Earth',
      },
      nodeTypes: {
        passive: 'Passive',
        active: 'Active',
      },
      available: 'Available',
      clickNodeToView: 'Click a node to view details',
      statBonuses: 'Stat Bonuses',
      unlocksSkill: 'Unlocks Skill',
      resetTitle: 'Reset Skill Tree',
      confirmReset: 'Confirm Reset',
    },
    talent: {
      title: 'Talent System',
      majorTalents: 'Innate Destiny',
      minorTalents: 'Acquired Insight',
      flaws: 'Shadow Flaws',
      innateDestiny: 'Innate Destiny',
      acquiredInsight: 'Acquired Insight',
      shadowFlaw: 'Shadow Flaw',
      fateChange: 'Fate Change',
      fateChangeCost: 'Cost',
      fateChangeCount: 'Fate Changes',
      fateChangeDescription: 'Spend spirit stones to change talents. Cost doubles each time.',
      selectDestiny: 'Choose Your Destiny',
      selectDestinyDescription: 'Each destiny contains one Innate Talent and one Acquired Insight. Some include a Flaw.',
      breakthroughInsight: 'Breakthrough Insight',
      breakthroughDescription: 'Breakthrough successful! Your experiences grant new insight.',
      confirmSelection: 'Confirm Selection',
      gainInsight: 'Gain Insight',
      skipForNow: 'Skip for now',
      currentBonuses: 'Current Bonuses',
      noBonuses: 'No active bonuses',
      noTalents: 'No talents selected. Choose when starting a new game.',
      scopes: {
        battle: 'Combat',
        market: 'Market',
        cultivation: 'Cultivation',
        spirit_beast: 'Spirit Beast',
        world_event: 'World Event',
      },
      categories: {
        combat: 'Combat',
        cultivation: 'Cultivation',
        market: 'Market',
        beast: 'Beast',
      },
      bonuses: {
        damageBonus: 'Damage Bonus',
        swordDamage: 'Sword Damage',
        damageReduction: 'Damage Reduction',
        critRate: 'Crit Rate',
        critDamage: 'Crit Damage',
        hpBonus: 'HP Bonus',
        qiCap: 'Qi Cap',
        executeDamage: 'Execute Damage',
        lowHpShield: 'Low HP Shield',
        cultivationExp: 'Cultivation Exp',
        combatExp: 'Combat Exp',
        idleExp: 'Idle Exp',
        breakthrough: 'Breakthrough',
        priceInsight: 'Price Insight',
        tradeProfit: 'Trade Profit',
        stockpileBonus: 'Stockpile Bonus',
        assetExp: 'Asset Exp',
        captureRate: 'Capture Rate',
        affinityCap: 'Affinity Cap',
        encounterRate: 'Encounter Rate',
        moodBoost: 'Mood Boost',
        trainingExp: 'Training Exp',
        battleBond: 'Battle Bond',
      },
    },
    spiritBeast: {
      title: 'Spirit Beast',
      collection: 'Beast Collection',
      empty: 'No spirit beasts yet. Go capture some!',
      details: 'Details',
      stats: 'Stats',
      skills: 'Skills',
      traits: 'Traits',
      level: 'Level',
      exp: 'EXP',
      tier: 'Tier',
      rarity: 'Rarity',
      element: 'Element',
      role: 'Role',
      personality: 'Personality',
      mood: 'Mood',
      affinity: 'Affinity',
      feed: 'Feed',
      train: 'Train',
      setActive: 'Set Active',
      removeActive: 'Remove Active',
      breakthrough: 'Breakthrough',
      capture: 'Capture',
      release: 'Release',
      battleMode: 'Battle Mode',
      tiers: {
        mortal: 'Mortal Beast',
        spirit: 'Spirit Beast',
        mystic: 'Mystic Beast',
        holy: 'Holy Beast',
      },
      roles: {
        attacker: 'Attacker',
        supporter: 'Supporter',
        tank: 'Tank',
        gatherer: 'Gatherer',
        hybrid: 'Hybrid',
      },
      personalities: {
        aggressive: 'Aggressive',
        calm: 'Calm',
        agile: 'Agile',
        wise: 'Wise',
        lucky: 'Lucky',
      },
      moods: {
        happy: 'Happy',
        calm: 'Calm',
        anxious: 'Anxious',
        fearful: 'Fearful',
        sick: 'Sick',
      },
      battleModes: {
        accompanying: 'Accompanying',
        summoned: 'Summoned',
        support: 'Support',
      },
      messages: {
        fed: 'Fed {name}, gained {exp} EXP, affinity +{affinity}',
        trained: 'Trained {name}, gained {exp} EXP',
        levelUp: '{name} leveled up! Now level {level}',
        breakthrough: '{name} breakthrough success! Advanced to {tier}',
        breakthroughFailed: 'Breakthrough failed, keep trying!',
        setActive: '{name} is now your active beast',
        removed: '{name} is no longer active',
        noSpace: 'Beast slots are full',
        captured: 'Successfully captured {name}!',
        captureFailed: 'Capture failed, {name} escaped',
        newSkill: '{name} learned a new skill: {skill}',
      },
    },
    help: {
      title: 'Cultivation Guide',
      realms: {
        title: 'Realm System',
        items: [
          'Qi Refining (9 layers)',
          'Foundation (4 stages)',
          'Core Formation (4 stages)',
          'Nascent Soul (4 stages)',
          'Spirit Transformation',
          '...',
        ],
      },
      tips: {
        title: 'Cultivation Tips',
        items: [
          'Closed-door: Fastest cultivation',
          'Market Station: Trade items',
          'Travel: May find opportunities or danger',
          'Attempt breakthrough when cultivation is full',
        ],
      },
      market: {
        title: 'Market Trading',
        items: [
          'Prices fluctuate over time',
          'Bulk buying raises prices',
          'Bulk selling lowers prices',
          'Watch for world events',
        ],
      },
      attributes: {
        title: 'Attribute Guide',
        items: [
          'Comprehension: Affects cultivation speed',
          'Luck: Affects breakthrough success',
          'Divine Sense: Affects combat accuracy',
          'Speed: Affects turn order in combat',
        ],
      },
    },
    logTypes: {
      cultivation: 'Cult',
      market: 'Trade',
      combat: 'Combat',
      event: 'Event',
      system: 'Sys',
      all: 'ALL',
    },
    common: {
      minimize: 'Minimize',
      global: 'Global',
      switchTo: 'Switch to',
      currentLanguage: 'English',
      otherLanguage: '中',
      otherStats: 'Other Stats',
      cancel: 'Cancel',
      confirm: 'Confirm',
      noItems: 'No items available',
      clickToView: 'Click to view details',
      defending: 'Defending',
      insight: 'Insight',
      rewards: 'Rewards',
      return: 'Return',
      enemyActing: 'Enemy is acting...',
      noCombatItems: 'No combat items available',
      noFeedItems: 'No feed items available',
    },
  },
};
