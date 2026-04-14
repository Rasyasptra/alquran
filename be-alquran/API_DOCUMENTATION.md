# Mosque App API Documentation

## Base URL
```
http://127.0.0.1:8000/api
```

## Authentication
Currently no authentication required (for development).

## Endpoints

### 1. Mosque Information

#### GET /api/mosque-info
Get mosque information

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Masjid Jami' Al-Ikhlas Kantor Pusat",
        "address": "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10110",
        "phone": "+62 21 1234 5678",
        "email": "info@masjid-alikhlas.com",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "timezone": "Asia/Jakarta",
        "description": "Masjid Jami' Al-Ikhlas adalah masjid utama...",
        "logo_url": "https://example.com/logo-masjid.png",
        "website_url": "https://masjid-alikhlas.com",
        "social_media": {
            "instagram": "https://instagram.com/masjid_alikhlas",
            "youtube": "https://youtube.com/@masjid_alikhlas",
            "facebook": "https://facebook.com/masjid.alikhlas"
        },
        "is_active": true
    }
}
```

#### POST /api/mosque-info
Create new mosque information

#### PUT /api/mosque-info
Update mosque information

---

### 2. Prayer Times

#### GET /api/prayer-times/today
Get today's prayer times

**Response:**
```json
{
    "success": true,
    "data": {
        "date": "2026-04-06",
        "hijri_date": "8",
        "is_ramadan": false,
        "prayer_times": {
            "fajr": {
                "time": "05:30",
                "iqama": "05:45"
            },
            "dhuhr": {
                "time": "12:01",
                "iqama": "12:15"
            },
            "asr": {
                "time": "15:30",
                "iqama": "15:45"
            },
            "maghrib": {
                "time": "18:15",
                "iqama": "18:20"
            },
            "isha": {
                "time": "19:30",
                "iqama": "19:45"
            }
        },
        "next_prayer": {
            "name": "dhuhr",
            "time": "12:01",
            "iqama": "12:15",
            "countdown": 3600
        },
        "mosque": {
            "name": "Masjid Jami' Al-Ikhlas Kantor Pusat",
            "timezone": "Asia/Jakarta"
        }
    }
}
```

#### GET /api/prayer-times/month/{month?}
Get prayer times for specific month
- `month`: Format YYYY-M (default: current month)

#### GET /api/prayer-times/countdown
Get countdown to next prayer

**Response:**
```json
{
    "success": true,
    "data": {
        "current_time": "11:30:00",
        "current_prayer": {
            "name": "fajr",
            "time": "05:30",
            "iqama": "05:45"
        },
        "next_prayer": {
            "name": "dhuhr",
            "time": "12:01",
            "iqama": "12:15",
            "countdown_seconds": 1860,
            "countdown_formatted": "00:31:00"
        }
    }
}
```

---

### 3. Daily Prayers

#### GET /api/daily-prayers
Get all daily prayers (optional filter by category)

**Query Parameters:**
- `category`: Filter by category (doa_adzan, doa_makan, etc.)

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "category": "doa_adzan",
            "category_name": "Doa Setelah Adzan",
            "title_ar": "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ",
            "title_id": "Doa Setelah Adzan",
            "arabic_text": "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ...",
            "latin_text": "Allahumma rabba hadzihid da'wati-t-tammati...",
            "translation_id": "Ya Allah, Tuhan yang menguasai seruan sempurna ini...",
            "source": "HR. Bukhari",
            "audio_url": null
        }
    ]
}
```

#### GET /api/daily-prayers/categories
Get all available prayer categories

**Response:**
```json
{
    "success": true,
    "data": {
        "doa_adzan": "Doa Setelah Adzan",
        "doa_makan": "Doa Sebelum & Sesudah Makan",
        "doa_pagi": "Doa Pagi Hari",
        "doa_petang": "Doa Petang Hari",
        "doa_tidur": "Doa Sebelum Tidur",
        "doa_bangun": "Doa Bangun Tidur",
        "doa_wudhu": "Doa Sebelum & Sesudah Wudhu",
        "doa_sholat": "Doa Setelah Sholat",
        "doa_safar": "Doa Bepergian",
        "doa_pakaian": "Doa Memakai Pakaian"
    }
}
```

#### GET /api/daily-prayers/category/{category}
Get prayers by specific category

#### GET /api/daily-prayers/random
Get random daily prayer

#### GET /api/daily-prayers/{id}
Get specific prayer by ID

---

### 4. Quran

#### GET /api/quran/surahs
Get all surahs with optional filters

**Query Parameters:**
- `with_audio`: Filter surahs with audio only (true/false)
- `revelation`: Filter by revelation type (meccan/madinan)
- `reciter`: Filter by reciter name

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "number": 1,
            "name_ar": "الفاتحة",
            "name_id": "Al-Fatihah",
            "translation_id": "Pembukaan",
            "number_of_verses": 7,
            "revelation": "Meccan",
            "audio": {
                "has_audio": true,
                "audio_url": "https://download.quranicaudio.com/quran/mishaari_raashid_al_afaasy/001.mp3",
                "reciter": "mishari_rashid",
                "duration": "00:04:35",
                "file_size": "1.04 MB",
                "format": "mp3"
            }
        }
    ]
}
```

#### GET /api/quran/surahs/with-audio
Get surahs that have audio murattal available

#### GET /api/quran/surahs/{number}
Get specific surah by number

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "number": 1,
        "name_ar": "الفاتحة",
        "name_id": "Al-Fatihah",
        "translation_id": "Pembukaan",
        "number_of_verses": 7,
        "revelation": "Meccan",
        "audio": {
            "has_audio": true,
            "audio_url": "https://download.quranicaudio.com/quran/mishaari_raashid_al_afaasy/001.mp3",
            "reciter": "mishari_rashid",
            "duration": "00:04:35",
            "file_size": "1.04 MB",
            "format": "mp3"
        }
    }
}
```

#### GET /api/quran/surahs/{number}/audio
Get audio streaming information for specific surah

**Response:**
```json
{
    "success": true,
    "data": {
        "surah_number": 1,
        "surah_name": "Al-Fatihah",
        "reciter": "mishari_rashid",
        "audio_url": "https://download.quranicaudio.com/quran/mishaari_raashid_al_afaasy/001.mp3",
        "duration": "00:04:35",
        "format": "mp3"
    }
}
```

#### GET /api/quran/reciters
Get list of available Quran reciters

**Response:**
```json
{
    "success": true,
    "data": {
        "mishari_rashid": "Mishari Rashid Alafasy",
        "abdul_rahman_al_sudais": "Abdul Rahman Al-Sudais",
        "saad_al_ghamdi": "Saad Al-Ghamdi",
        "mahmoud_khalil": "Mahmoud Khalil Al-Husary",
        "ali_jaber": "Ali Jaber"
    }
}
```

#### GET /api/quran/reciters/{reciter}
Get all surahs by specific reciter

#### GET /api/quran/search
Search surahs by name

**Query Parameters:**
- `q`: Search query (surah name in Arabic, Indonesian, or translation)

**Response:**
```json
{
    "success": true,
    "query": "fatihah",
    "data": [
        {
            "id": 1,
            "number": 1,
            "name_ar": "الفاتحة",
            "name_id": "Al-Fatihah",
            "translation_id": "Pembukaan",
            "revelation": "Meccan",
            "has_audio": true,
            "reciter": "mishari_rashid"
        }
    ]
}
```

---

## Error Responses

**404 Not Found:**
```json
{
    "success": false,
    "message": "Resource not found"
}
```

**422 Validation Error:**
```json
{
    "success": false,
    "message": "The given data was invalid.",
    "errors": {
        "field": ["The field is required."]
    }
}
```

---

## Frontend Integration Examples

### React with Axios

```javascript
// Get today's prayer times
const getPrayerTimes = async () => {
    try {
        const response = await axios.get('/api/prayer-times/today');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching prayer times:', error);
    }
};

// Get daily prayers
const getDailyPrayers = async (category = null) => {
    try {
        const url = category ? `/api/daily-prayers?category=${category}` : '/api/daily-prayers';
        const response = await axios.get(url);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching daily prayers:', error);
    }
};

// Get mosque info
const getMosqueInfo = async () => {
    try {
        const response = await axios.get('/api/mosque-info');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching mosque info:', error);
    }
};
```

### JavaScript Fetch API

```javascript
// Get countdown to next prayer
fetch('/api/prayer-times/countdown')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const nextPrayer = data.data.next_prayer;
            console.log(`Next prayer: ${nextPrayer.name} at ${nextPrayer.time}`);
        }
    });
```

### React with Axios - Quran Audio Player

```javascript
// Get surahs with audio
const getSurahsWithAudio = async () => {
    try {
        const response = await axios.get('/api/quran/surahs/with-audio');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching surahs:', error);
    }
};

// Play surah audio
const playSurahAudio = async (surahNumber) => {
    try {
        const response = await axios.get(`/api/quran/surahs/${surahNumber}/audio`);
        const audioData = response.data.data;
        
        // Create audio element
        const audio = new Audio(audioData.audio_url);
        audio.play();
        
        return audioData;
    } catch (error) {
        console.error('Error playing audio:', error);
    }
};

// Search surahs
const searchSurahs = async (query) => {
    try {
        const response = await axios.get(`/api/quran/search?q=${query}`);
        return response.data.data;
    } catch (error) {
        console.error('Error searching surahs:', error);
    }
};
```

### Audio Player Component Example

```javascript
const QuranAudioPlayer = ({ surah }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="surah-audio-player">
            <h3>{surah.name_ar}</h3>
            <p>{surah.name_id} - {surah.translation_id}</p>
            <p>Qori: {surah.audio.reciter}</p>
            <p>Durasi: {surah.audio.duration}</p>
            
            <audio ref={audioRef} src={surah.audio.audio_url} />
            
            <button onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
        </div>
    );
};
```

---

## Audio Sources

The audio files are sourced from:
- **QuranicAudio.com** - High quality MP3 files
- **Reciters Available**: Mishari Rashid Alafasy, Abdul Rahman Al-Sudais, Saad Al-Ghamdi, etc.
- **Format**: MP3 (128 kbps)
- **Languages**: Arabic only (recitation)

**Note**: For production use, consider:
1. Hosting audio files on CDN for better performance
2. Implement audio streaming with proper headers
3. Add audio download functionality
4. Support multiple reciters per surah
5. Add audio quality options (64kbps, 128kbps, 192kbps)

---

## Next Steps

1. **Frontend Implementation**: Create React components for Quran audio player
2. **Audio Features**: Add playback controls, progress bar, volume control
3. **Offline Support**: Cache audio files for offline playback
4. **Playlist**: Create playlist functionality (e.g., play consecutive surahs)
5. **Admin Panel**: Interface to manage audio files and reciters
6. **Mobile App**: Develop mobile app with background audio support
