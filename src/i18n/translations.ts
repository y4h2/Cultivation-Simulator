export type Language = 'zh' | 'en';

export interface Translations {
  // App
  app: {
    title: string;
    subtitle: string;
  };
  // Clan System
  clan: {
    title: string;
    joinClan: string;
    clanName: string;
    notJoined: string;
    notJoinedDesc: string;
    status: string;
    contributions: string;
    monthlyContributions: string;
    affinity: string;
    atmosphere: string;
    temperature: string;
    methods: string;
    peaks: string;
    halls: string;
    activities: string;
    npcs: string;
    master: string;
    noMaster: string;
    reputation: string;
    selectActivity: string;
    doActivity: string;
    visitPeak: string;
    visitHall: string;
    interactNPC: string;
    peakNames: {
      sword_peak: string;
      alchemy_peak: string;
      beast_garden: string;
      scripture_cliff: string;
      commerce_hall: string;
    };
    hallNames: {
      dining_hall: string;
      discipline_hall: string;
      teaching_hall: string;
      chores_hall: string;
    };
    statusNames: {
      guest: string;
      registered: string;
      direct_disciple: string;
      successor: string;
    };
    lifeCircles: {
      below_mountain: string;
      main_gate: string;
      cloud_peak: string;
    };
    roles: {
      peak_master: string;
      grand_elder: string;
      elder: string;
      instructor: string;
      senior_disciple: string;
      junior_disciple: string;
      logistics: string;
      worker: string;
      merchant: string;
      guest_cultivator: string;
    };
    personalities: {
      warm: string;
      strict: string;
      pragmatic: string;
      carefree: string;
      eccentric: string;
      cold: string;
      jealous: string;
      supportive: string;
    };
    activityNames: {
      eat_meal: string;
      gossip: string;
      attend_lecture: string;
      group_training: string;
      seek_guidance: string;
      do_chores: string;
      deliver_message: string;
      help_trade: string;
      review_accounts: string;
      visit_beasts: string;
      beast_training: string;
      attend_class: string;
      find_mentor: string;
      study_techniques: string;
      read_records: string;
      meet_master: string;
    };
    relationship: {
      affection: string;
      trust: string;
      respect: string;
      familiarity: string;
      mood: string;
    };
    relationshipLevels: {
      very_close: string;
      close: string;
      friendly: string;
      acquaintance: string;
      stranger: string;
      hostile: string;
    };
    messages: {
      activityComplete: string;
      gossipHeard: string;
      eventTriggered: string;
      relationshipUp: string;
      relationshipDown: string;
      contributionGained: string;
      wudaoGained: string;
    };
    eventChoice: string;
    noEvents: string;
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
    character: string;
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
    refreshTalents: string;
    refreshTalentsDesc: string;
    refreshTalentsCost: string;
    confirmRefresh: string;
    confirmRefreshDesc: string;
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
  // World Events
  worldEvent: {
    title: string;
    activeEvents: string;
    noEvents: string;
    noEventsDescription: string;
    intel: string;
    remaining: string;
    phase: string;
    effects: string;
    progress: string;
    currentPhase: string;
    detailsUnknown: string;
    effectsOverview: string;
    noActiveEffects: string;
    clickToViewDetails: string;
    priceChanges: string;
    encounterRates: string;
    dropRates: string;
    elementDamage: string;
    otherEffects: string;
    cultivation: string;
    captureRate: string;
    unlockedAreas: string;
    scopes: {
      minor: string;
      regional: string;
      global: string;
    };
    categories: {
      market: string;
      war: string;
      natural: string;
      resource: string;
      policy: string;
      beast: string;
      personal: string;
    };
    sources: {
      rumor: string;
      sect_notice: string;
      tianji: string;
      black_market: string;
    };
    newsModal: {
      title: string;
      all: string;
      unread: string;
      noIntel: string;
      new: string;
      reliable: string;
      related: string;
      footer: string;
    };
    targets: {
      herbs: string;
      beast_materials: string;
      fire: string;
      fire_materials: string;
      rare_materials: string;
      pills: string;
      beasts: string;
      bosses: string;
      cultivators: string;
      combat: string;
      all: string;
      secret_realm: string;
    };
    effectTypes: {
      price_modifier: string;
      drop_rate_bonus: string;
      encounter_rate: string;
      element_damage_bonus: string;
      cultivation_bonus: string;
      capture_rate_bonus: string;
      unlock_area: string;
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
  // Equipment System
  equipment: {
    title: string;
    equipped: string;
    inventory: string;
    empty: string;
    emptySlot: string;
    equip: string;
    unequip: string;
    enhance: string;
    compare: string;
    discard: string;
    details: string;
    stats: string;
    setBonus: string;
    activePieces: string;
    currentStats: string;
    newStats: string;
    difference: string;
    enhanceLevel: string;
    enhanceCost: string;
    enhanceSuccess: string;
    enhanceFailed: string;
    maxLevel: string;
    inventoryFull: string;
    noEquipment: string;
    grade: string;
    element: string;
    affixes: string;
    slots: {
      weapon: string;
      armor: string;
      helmet: string;
      accessory: string;
      boots: string;
      talisman: string;
    };
    rarities: {
      common: string;
      uncommon: string;
      rare: string;
      epic: string;
      legendary: string;
    };
    grades: {
      lower: string;
      middle: string;
      upper: string;
      supreme: string;
    };
    statNames: {
      atk: string;
      def: string;
      hp: string;
      mp: string;
      spd: string;
      crit: string;
      critDmg: string;
      acc: string;
      eva: string;
      wis: string;
      sense: string;
      luck: string;
      cultivationBonus: string;
    };
  };
  // Storyline/Main Quest System
  storyline: {
    title: string;
    chapter: string;
    currentChapter: string;
    progress: string;
    mainQuest: string;
    branchQuest: string;
    optionalQuest: string;
    available: string;
    inProgress: string;
    completed: string;
    locked: string;
    requirements: string;
    rewards: string;
    startQuest: string;
    continueQuest: string;
    completeQuest: string;
    makeChoice: string;
    nextDialogue: string;
    skipDialogue: string;
    questLog: string;
    noQuests: string;
    noQuestsDesc: string;
    chapterComplete: string;
    newQuestAvailable: string;
    nodeTypes: {
      main: string;
      branch: string;
      optional: string;
    };
    conditionTypes: {
      realm: string;
      time: string;
      contribution: string;
      affinity: string;
      nodeComplete: string;
      chapterComplete: string;
      spiritStones: string;
      beastCount: string;
    };
    effectTypes: {
      unlockSystem: string;
      unlockArea: string;
      giveItem: string;
      giveSpiritStones: string;
      giveContribution: string;
      giveWudaoPoints: string;
      giveCultivation: string;
    };
    messages: {
      questStarted: string;
      questCompleted: string;
      chapterCompleted: string;
      choiceMade: string;
      rewardReceived: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  zh: {
    app: {
      title: '修仙模拟器',
      subtitle: 'Cultivation Simulator',
    },
    clan: {
      title: '宗门',
      joinClan: '加入宗门',
      clanName: '宗门名称',
      notJoined: '尚未加入宗门',
      notJoinedDesc: '寻找一个宗门开始你的修炼之路...',
      status: '身份',
      contributions: '贡献',
      monthlyContributions: '本月贡献',
      affinity: '亲和度',
      atmosphere: '宗门氛围',
      temperature: '温度',
      methods: '手段',
      peaks: '峰脉',
      halls: '事务堂',
      activities: '日常活动',
      npcs: '宗门人物',
      master: '师父',
      noMaster: '尚无师父',
      reputation: '声望',
      selectActivity: '选择活动',
      doActivity: '进行活动',
      visitPeak: '前往峰脉',
      visitHall: '前往事务堂',
      interactNPC: '与人交流',
      peakNames: {
        sword_peak: '剑锋',
        alchemy_peak: '丹台',
        beast_garden: '灵兽苑',
        scripture_cliff: '藏经崖',
        commerce_hall: '商行阁',
      },
      hallNames: {
        dining_hall: '斋堂',
        discipline_hall: '刑堂',
        teaching_hall: '传功堂',
        chores_hall: '杂务堂',
      },
      statusNames: {
        guest: '过客',
        registered: '座下弟子',
        direct_disciple: '亲传弟子',
        successor: '继承人',
      },
      lifeCircles: {
        below_mountain: '山下圈',
        main_gate: '山门圈',
        cloud_peak: '云巅圈',
      },
      roles: {
        peak_master: '峰主',
        grand_elder: '太上长老',
        elder: '长老',
        instructor: '传功师',
        senior_disciple: '师兄/姐',
        junior_disciple: '师弟/妹',
        logistics: '后勤弟子',
        worker: '杂役',
        merchant: '商贩',
        guest_cultivator: '客卿',
      },
      personalities: {
        warm: '温柔',
        strict: '严厉',
        pragmatic: '功利',
        carefree: '佛系',
        eccentric: '疯批',
        cold: '冷漠',
        jealous: '嫉妒',
        supportive: '热心',
      },
      activityNames: {
        eat_meal: '用餐',
        gossip: '闲聊',
        attend_lecture: '听道',
        group_training: '集体修炼',
        seek_guidance: '请教',
        do_chores: '做杂务',
        deliver_message: '送信',
        help_trade: '协助贸易',
        review_accounts: '查账',
        visit_beasts: '看灵兽',
        beast_training: '灵兽训练',
        attend_class: '上课',
        find_mentor: '寻师',
        study_techniques: '研习功法',
        read_records: '查阅典籍',
        meet_master: '请安',
      },
      relationship: {
        affection: '情谊',
        trust: '信任',
        respect: '尊敬',
        familiarity: '熟悉度',
        mood: '心情',
      },
      relationshipLevels: {
        very_close: '亲密无间',
        close: '亲近',
        friendly: '友善',
        acquaintance: '相识',
        stranger: '陌生',
        hostile: '敌对',
      },
      messages: {
        activityComplete: '完成了{activity}',
        gossipHeard: '听到了一些传闻：{gossip}',
        eventTriggered: '发生了意外事件！',
        relationshipUp: '与{name}的关系提升了',
        relationshipDown: '与{name}的关系下降了',
        contributionGained: '获得{value}贡献点',
        wudaoGained: '获得{value}悟道点',
      },
      eventChoice: '做出选择',
      noEvents: '当前没有待处理的事件',
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
      character: '角色',
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
      noTalents: '尚无天赋',
      refreshTalents: '刷新天赋',
      refreshTalentsDesc: '消耗灵石重新随机天赋，将获得全新的天赋组合。',
      refreshTalentsCost: '费用',
      confirmRefresh: '确认刷新天赋',
      confirmRefreshDesc: '确定要刷新天赋吗？当前所有天赋将被替换为新的随机天赋。',
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
    worldEvent: {
      title: '天下大势',
      activeEvents: '进行中的事件',
      noEvents: '天下太平，暂无大事',
      noEventsDescription: '继续修炼，等待风云变幻...',
      intel: '情报',
      remaining: '剩余',
      phase: '阶段',
      effects: '效果',
      progress: '事件进程',
      currentPhase: '当前阶段进度',
      detailsUnknown: '尚未发现详情',
      effectsOverview: '世界效果总览',
      noActiveEffects: '当前无活动效果',
      clickToViewDetails: '点击事件查看详情',
      priceChanges: '价格变动',
      encounterRates: '遭遇率',
      dropRates: '掉落率',
      elementDamage: '元素伤害',
      otherEffects: '其他效果',
      cultivation: '修炼效率',
      captureRate: '捕获率',
      unlockedAreas: '开放区域',
      scopes: {
        minor: '局部',
        regional: '区域',
        global: '全局',
      },
      categories: {
        market: '市场',
        war: '战争',
        natural: '自然',
        resource: '资源',
        policy: '政策',
        beast: '灵兽',
        personal: '个人',
      },
      sources: {
        rumor: '市井传闻',
        sect_notice: '宗门公告',
        tianji: '天机阁',
        black_market: '黑市情报',
      },
      newsModal: {
        title: '天下情报',
        all: '全部',
        unread: '未读',
        noIntel: '暂无情报',
        new: '新',
        reliable: '可信',
        related: '相关事件',
        footer: '情报来源不同，可靠性也各异。天机阁情报最为准确，但需付费。',
      },
      targets: {
        herbs: '草药',
        beast_materials: '妖兽材料',
        fire: '火系',
        fire_materials: '火属性材料',
        rare_materials: '稀有材料',
        pills: '丹药',
        beasts: '妖兽',
        bosses: '首领',
        cultivators: '修士',
        combat: '战斗',
        all: '全部',
        secret_realm: '秘境',
      },
      effectTypes: {
        price_modifier: '价格',
        drop_rate_bonus: '掉落率',
        encounter_rate: '遭遇率',
        element_damage_bonus: '元素伤害',
        cultivation_bonus: '修炼效率',
        capture_rate_bonus: '捕获率',
        unlock_area: '解锁区域',
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
    equipment: {
      title: '装备',
      equipped: '已装备',
      inventory: '装备背包',
      empty: '装备栏为空',
      emptySlot: '空槽位',
      equip: '装备',
      unequip: '卸下',
      enhance: '强化',
      compare: '对比',
      discard: '丢弃',
      details: '详情',
      stats: '属性',
      setBonus: '套装效果',
      activePieces: '激活件数',
      currentStats: '当前属性',
      newStats: '新属性',
      difference: '差异',
      enhanceLevel: '强化等级',
      enhanceCost: '强化消耗',
      enhanceSuccess: '强化成功！',
      enhanceFailed: '强化失败',
      maxLevel: '已达最高等级',
      inventoryFull: '装备背包已满',
      noEquipment: '暂无装备',
      grade: '品阶',
      element: '元素',
      affixes: '词条',
      slots: {
        weapon: '武器',
        armor: '护甲',
        helmet: '头饰',
        accessory: '饰品',
        boots: '靴子',
        talisman: '护符',
      },
      rarities: {
        common: '凡品',
        uncommon: '灵品',
        rare: '宝品',
        epic: '地品',
        legendary: '仙品',
      },
      grades: {
        lower: '下品',
        middle: '中品',
        upper: '上品',
        supreme: '极品',
      },
      statNames: {
        atk: '攻击',
        def: '防御',
        hp: '生命',
        mp: '灵力',
        spd: '速度',
        crit: '暴击',
        critDmg: '暴伤',
        acc: '命中',
        eva: '闪避',
        wis: '悟性',
        sense: '神识',
        luck: '气运',
        cultivationBonus: '修炼效率',
      },
    },
    storyline: {
      title: '主线',
      chapter: '章节',
      currentChapter: '当前章节',
      progress: '进度',
      mainQuest: '主线任务',
      branchQuest: '支线任务',
      optionalQuest: '可选任务',
      available: '可接取',
      inProgress: '进行中',
      completed: '已完成',
      locked: '未解锁',
      requirements: '要求',
      rewards: '奖励',
      startQuest: '开始任务',
      continueQuest: '继续',
      completeQuest: '完成任务',
      makeChoice: '做出选择',
      nextDialogue: '继续',
      skipDialogue: '跳过',
      questLog: '任务日志',
      noQuests: '暂无可用任务',
      noQuestsDesc: '继续修炼，等待机缘...',
      chapterComplete: '章节完成',
      newQuestAvailable: '新任务可接取',
      nodeTypes: {
        main: '主线',
        branch: '支线',
        optional: '可选',
      },
      conditionTypes: {
        realm: '境界',
        time: '时间',
        contribution: '贡献',
        affinity: '亲和',
        nodeComplete: '任务完成',
        chapterComplete: '章节完成',
        spiritStones: '灵石',
        beastCount: '灵兽数量',
      },
      effectTypes: {
        unlockSystem: '解锁系统',
        unlockArea: '解锁区域',
        giveItem: '获得物品',
        giveSpiritStones: '获得灵石',
        giveContribution: '获得贡献',
        giveWudaoPoints: '获得悟道点',
        giveCultivation: '获得修为',
      },
      messages: {
        questStarted: '任务开始：{quest}',
        questCompleted: '任务完成：{quest}',
        chapterCompleted: '章节完成：{chapter}',
        choiceMade: '做出了选择',
        rewardReceived: '获得奖励',
      },
    },
  },
  en: {
    app: {
      title: 'Cultivation Simulator',
      subtitle: 'Xiuxian',
    },
    clan: {
      title: 'Sect',
      joinClan: 'Join Sect',
      clanName: 'Sect Name',
      notJoined: 'Not Yet Joined',
      notJoinedDesc: 'Find a sect to begin your cultivation path...',
      status: 'Status',
      contributions: 'Contributions',
      monthlyContributions: 'Monthly Contributions',
      affinity: 'Affinity',
      atmosphere: 'Sect Atmosphere',
      temperature: 'Temperature',
      methods: 'Methods',
      peaks: 'Peaks',
      halls: 'Halls',
      activities: 'Daily Activities',
      npcs: 'Sect Members',
      master: 'Master',
      noMaster: 'No Master',
      reputation: 'Reputation',
      selectActivity: 'Select Activity',
      doActivity: 'Do Activity',
      visitPeak: 'Visit Peak',
      visitHall: 'Visit Hall',
      interactNPC: 'Interact',
      peakNames: {
        sword_peak: 'Sword Peak',
        alchemy_peak: 'Alchemy Peak',
        beast_garden: 'Beast Garden',
        scripture_cliff: 'Scripture Cliff',
        commerce_hall: 'Commerce Hall',
      },
      hallNames: {
        dining_hall: 'Dining Hall',
        discipline_hall: 'Discipline Hall',
        teaching_hall: 'Teaching Hall',
        chores_hall: 'Chores Hall',
      },
      statusNames: {
        guest: 'Guest',
        registered: 'Registered Disciple',
        direct_disciple: 'Direct Disciple',
        successor: 'Successor',
      },
      lifeCircles: {
        below_mountain: 'Below Mountain',
        main_gate: 'Main Gate',
        cloud_peak: 'Cloud Peak',
      },
      roles: {
        peak_master: 'Peak Master',
        grand_elder: 'Grand Elder',
        elder: 'Elder',
        instructor: 'Instructor',
        senior_disciple: 'Senior Disciple',
        junior_disciple: 'Junior Disciple',
        logistics: 'Logistics',
        worker: 'Worker',
        merchant: 'Merchant',
        guest_cultivator: 'Guest Cultivator',
      },
      personalities: {
        warm: 'Warm',
        strict: 'Strict',
        pragmatic: 'Pragmatic',
        carefree: 'Carefree',
        eccentric: 'Eccentric',
        cold: 'Cold',
        jealous: 'Jealous',
        supportive: 'Supportive',
      },
      activityNames: {
        eat_meal: 'Eat Meal',
        gossip: 'Gossip',
        attend_lecture: 'Attend Lecture',
        group_training: 'Group Training',
        seek_guidance: 'Seek Guidance',
        do_chores: 'Do Chores',
        deliver_message: 'Deliver Message',
        help_trade: 'Help Trade',
        review_accounts: 'Review Accounts',
        visit_beasts: 'Visit Beasts',
        beast_training: 'Beast Training',
        attend_class: 'Attend Class',
        find_mentor: 'Find Mentor',
        study_techniques: 'Study Techniques',
        read_records: 'Read Records',
        meet_master: 'Meet Master',
      },
      relationship: {
        affection: 'Affection',
        trust: 'Trust',
        respect: 'Respect',
        familiarity: 'Familiarity',
        mood: 'Mood',
      },
      relationshipLevels: {
        very_close: 'Very Close',
        close: 'Close',
        friendly: 'Friendly',
        acquaintance: 'Acquaintance',
        stranger: 'Stranger',
        hostile: 'Hostile',
      },
      messages: {
        activityComplete: 'Completed {activity}',
        gossipHeard: 'Heard some gossip: {gossip}',
        eventTriggered: 'An event occurred!',
        relationshipUp: 'Relationship with {name} improved',
        relationshipDown: 'Relationship with {name} declined',
        contributionGained: 'Gained {value} contribution points',
        wudaoGained: 'Gained {value} Dao points',
      },
      eventChoice: 'Make a Choice',
      noEvents: 'No pending events',
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
      character: 'Character',
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
      noTalents: 'No talents yet',
      refreshTalents: 'Refresh Talents',
      refreshTalentsDesc: 'Spend spirit stones to re-roll talents. You will get a completely new talent set.',
      refreshTalentsCost: 'Cost',
      confirmRefresh: 'Confirm Talent Refresh',
      confirmRefreshDesc: 'Are you sure you want to refresh talents? All current talents will be replaced with new random ones.',
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
    worldEvent: {
      title: 'World Events',
      activeEvents: 'Active Events',
      noEvents: 'The world is at peace. No major events.',
      noEventsDescription: 'Continue cultivating, await changes...',
      intel: 'Intel',
      remaining: 'Left',
      phase: 'Phase',
      effects: 'Effects',
      progress: 'Event Progress',
      currentPhase: 'Current Phase Progress',
      detailsUnknown: 'Details unknown',
      effectsOverview: 'World Effects Overview',
      noActiveEffects: 'No active effects',
      clickToViewDetails: 'Click an event to view details',
      priceChanges: 'Price Changes',
      encounterRates: 'Encounter Rates',
      dropRates: 'Drop Rates',
      elementDamage: 'Element Damage',
      otherEffects: 'Other Effects',
      cultivation: 'Cultivation',
      captureRate: 'Capture Rate',
      unlockedAreas: 'Unlocked Areas',
      scopes: {
        minor: 'Local',
        regional: 'Regional',
        global: 'Global',
      },
      categories: {
        market: 'Market',
        war: 'War',
        natural: 'Natural',
        resource: 'Resource',
        policy: 'Policy',
        beast: 'Beast',
        personal: 'Personal',
      },
      sources: {
        rumor: 'Rumors',
        sect_notice: 'Sect Notice',
        tianji: 'Tianji Oracle',
        black_market: 'Black Market',
      },
      newsModal: {
        title: 'World Intel',
        all: 'All',
        unread: 'Unread',
        noIntel: 'No intel available',
        new: 'NEW',
        reliable: 'reliable',
        related: 'Related Event',
        footer: 'Intel reliability varies by source. Tianji Oracle is most accurate but requires payment.',
      },
      targets: {
        herbs: 'Herbs',
        beast_materials: 'Beast Materials',
        fire: 'Fire',
        fire_materials: 'Fire Materials',
        rare_materials: 'Rare Materials',
        pills: 'Pills',
        beasts: 'Beasts',
        bosses: 'Bosses',
        cultivators: 'Cultivators',
        combat: 'Combat',
        all: 'All',
        secret_realm: 'Secret Realm',
      },
      effectTypes: {
        price_modifier: 'Price',
        drop_rate_bonus: 'Drop Rate',
        encounter_rate: 'Encounter Rate',
        element_damage_bonus: 'Element Damage',
        cultivation_bonus: 'Cultivation',
        capture_rate_bonus: 'Capture Rate',
        unlock_area: 'Unlock Area',
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
    equipment: {
      title: 'Equipment',
      equipped: 'Equipped',
      inventory: 'Equipment Bag',
      empty: 'Equipment is empty',
      emptySlot: 'Empty Slot',
      equip: 'Equip',
      unequip: 'Unequip',
      enhance: 'Enhance',
      compare: 'Compare',
      discard: 'Discard',
      details: 'Details',
      stats: 'Stats',
      setBonus: 'Set Bonus',
      activePieces: 'Active Pieces',
      currentStats: 'Current Stats',
      newStats: 'New Stats',
      difference: 'Difference',
      enhanceLevel: 'Enhancement Level',
      enhanceCost: 'Enhancement Cost',
      enhanceSuccess: 'Enhancement successful!',
      enhanceFailed: 'Enhancement failed',
      maxLevel: 'Max level reached',
      inventoryFull: 'Equipment bag is full',
      noEquipment: 'No equipment',
      grade: 'Grade',
      element: 'Element',
      affixes: 'Affixes',
      slots: {
        weapon: 'Weapon',
        armor: 'Armor',
        helmet: 'Helmet',
        accessory: 'Accessory',
        boots: 'Boots',
        talisman: 'Talisman',
      },
      rarities: {
        common: 'Common',
        uncommon: 'Uncommon',
        rare: 'Rare',
        epic: 'Epic',
        legendary: 'Legendary',
      },
      grades: {
        lower: 'Lower',
        middle: 'Middle',
        upper: 'Upper',
        supreme: 'Supreme',
      },
      statNames: {
        atk: 'ATK',
        def: 'DEF',
        hp: 'HP',
        mp: 'MP',
        spd: 'SPD',
        crit: 'CRIT',
        critDmg: 'CRIT DMG',
        acc: 'ACC',
        eva: 'EVA',
        wis: 'WIS',
        sense: 'Sense',
        luck: 'Luck',
        cultivationBonus: 'Cultivation Bonus',
      },
    },
    storyline: {
      title: 'Story',
      chapter: 'Chapter',
      currentChapter: 'Current Chapter',
      progress: 'Progress',
      mainQuest: 'Main Quest',
      branchQuest: 'Branch Quest',
      optionalQuest: 'Optional Quest',
      available: 'Available',
      inProgress: 'In Progress',
      completed: 'Completed',
      locked: 'Locked',
      requirements: 'Requirements',
      rewards: 'Rewards',
      startQuest: 'Start Quest',
      continueQuest: 'Continue',
      completeQuest: 'Complete Quest',
      makeChoice: 'Make Choice',
      nextDialogue: 'Continue',
      skipDialogue: 'Skip',
      questLog: 'Quest Log',
      noQuests: 'No Available Quests',
      noQuestsDesc: 'Continue cultivating, await opportunities...',
      chapterComplete: 'Chapter Complete',
      newQuestAvailable: 'New Quest Available',
      nodeTypes: {
        main: 'Main',
        branch: 'Branch',
        optional: 'Optional',
      },
      conditionTypes: {
        realm: 'Realm',
        time: 'Time',
        contribution: 'Contribution',
        affinity: 'Affinity',
        nodeComplete: 'Quest Complete',
        chapterComplete: 'Chapter Complete',
        spiritStones: 'Spirit Stones',
        beastCount: 'Beast Count',
      },
      effectTypes: {
        unlockSystem: 'Unlock System',
        unlockArea: 'Unlock Area',
        giveItem: 'Receive Item',
        giveSpiritStones: 'Receive Spirit Stones',
        giveContribution: 'Receive Contribution',
        giveWudaoPoints: 'Receive Dao Points',
        giveCultivation: 'Receive Cultivation',
      },
      messages: {
        questStarted: 'Quest started: {quest}',
        questCompleted: 'Quest completed: {quest}',
        chapterCompleted: 'Chapter completed: {chapter}',
        choiceMade: 'Choice made',
        rewardReceived: 'Rewards received',
      },
    },
  },
};
