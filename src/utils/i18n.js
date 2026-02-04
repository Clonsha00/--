export const DICTIONARY = {
    'en': {
        // ListSection
        'TASK_NAME': 'TASK NAME',
        'DEADLINE': 'DEADLINE',
        'TYPE': 'TYPE',
        'NOTE': 'NOTE',
        'ADD_TASK': 'ADD_TASK',
        'NO_DATA': 'NO DATA FOUND...',
        'ENTER_TASK': 'Enter task...',
        'SELECT_DATE': 'SELECT DATE...',
        'ENTER_NOTE': 'e.g. Details...',
        'MANAGE': '[ Manage... ]',
        'CONFIG': '[ CONFIG ]',
        'SPAWN_15': 'SPAWN 15',
        'CLEAR_ALL': 'CLEAR ALL',

        // SettingsModal
        'SYSTEM_CONFIG': '> SYSTEM_CONFIG',
        'INPUT_HEADER': 'INPUT HEADER TEXT',
        'LANGUAGE': 'LANGUAGE (語言)',
        'SAVE': 'SAVE',
        'CANCEL': 'CANCEL',
        'PLACEHOLDER_HEADER': 'e.g. INITIATE PROTOCOL...',
        'HEADER_SIZE': 'HEADER SIZE',
        'THEME': 'THEME',
        'THEME_RETRO': 'Retrowave',
        'THEME_CYBER': 'Cyberpunk 2077',
        'THEME_ZEN': 'Zen (Matrix)',
        'THEME_RANDOM': 'Random',
        'BUBBLE_STYLE': 'VISUAL STYLE',
        'STYLE_PIXEL': 'Classic Pixel',
        'STYLE_PLANET': 'Planet System',

        // IntuitiveSection
        'MUSIC': 'MUSIC',
        'MUSIC_VOLUME': 'MUSIC VOLUME',
        'OFF': 'OFF',
        'FOCUS_MODE': 'FOCUS MODE',
        'ACTIVE': 'ACTIVE',
        'ALL_CLEAR': 'ALL CLEAR',
        'RELAX_MODE': 'RELAX MODE',
        'LEFT': 'left', // time left
        'DAYS': 'd',    // days left
        'RETURN': '[ RETURN ]',
        'FOCUS_STATUS_ACTIVE': '[ FOCUS MODE: ON (PRESS F) ]',
        'FOCUS_STATUS_OFF': '[ FOCUS MODE: OFF (PRESS F) ]',

        // Categories (Defaults)
        'Work': 'Work',
        'Personal': 'Personal',
        'Hobby': 'Hobby'
    },
    'zh-TW': {
        // ListSection
        'TASK_NAME': '任務名稱',
        'DEADLINE': '截止時間',
        'TYPE': '類型',
        'NOTE': '備註',
        'ADD_TASK': '新增任務',
        'NO_DATA': '暫無數據...',
        'ENTER_TASK': '輸入任務內容...',
        'SELECT_DATE': '選擇日期...',
        'ENTER_NOTE': '例如：詳細資訊...',
        'MANAGE': '[ 管理分類... ]',
        'CONFIG': '[ 設定 ]',
        'SPAWN_15': '生成 15 個 (測試)',
        'CLEAR_ALL': '全部清除',

        // SettingsModal
        'SYSTEM_CONFIG': '> 系統設定',
        'INPUT_HEADER': '輸入區標題文字',
        'LANGUAGE': '語言 (Language)',
        'SAVE': '儲存',
        'CANCEL': '取消',
        'PLACEHOLDER_HEADER': '例如: 啟動專注協議...',
        'HEADER_SIZE': '標題大小',
        'THEME': '風格主題',
        'THEME_RETRO': '合成波',
        'THEME_CYBER': '賽博龐克 2077',
        'THEME_ZEN': '禪',
        'THEME_RANDOM': '隨機',
        'BUBBLE_STYLE': '顯示風格',
        'STYLE_PIXEL': '經典像素',
        'STYLE_PLANET': '行星體系',

        // IntuitiveSection
        'MUSIC': '音樂',
        'MUSIC_VOLUME': '音樂音量',
        'OFF': '關閉',
        'FOCUS_MODE': '專注模式',
        'ACTIVE': '已啟動',
        'ALL_CLEAR': '任務清空',
        'RELAX_MODE': '休閒模式',
        'LEFT': '剩餘',
        'DAYS': '天',
        'RETURN': '[ 返回列表 ]',
        'FOCUS_STATUS_ACTIVE': '[ 專注模式: 開啟 (切換按F鍵) ]',
        'FOCUS_STATUS_OFF': '[ 專注模式: 關閉 (切換按F鍵) ]',

        // Categories (Defaults)
        'Work': '工作',
        'Personal': '個人',
        'Hobby': '興趣',
        'EXP': '期限'
    }
};

export const t = (key, lang = 'en') => {
    // Fallback to English if key missing in target lang
    return DICTIONARY[lang]?.[key] || DICTIONARY['en'][key] || key;
};
