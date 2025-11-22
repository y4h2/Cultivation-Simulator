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
  // Tabs
  tabs: {
    cultivation: string;
    market: string;
    inventory: string;
    combat: string;
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
    tabs: {
      cultivation: '修炼',
      market: '坊市',
      inventory: '储物',
      combat: '战斗',
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
      layer: '第{n}层',
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
    tabs: {
      cultivation: 'Cultivation',
      market: 'Market',
      inventory: 'Inventory',
      combat: 'Combat',
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
      layer: 'Layer {n}',
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
  },
};
