import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Track {
  title: string;
  artist: string;
  duration: string;
  url?: string;
  file?: File;
}

const Index = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [playlist, setPlaylist] = useState<Track[]>([
    { title: "Мёртвый Анархист", artist: "Король и Шут", duration: "3:42" },
    { title: "Золото мёртвых", artist: "NAGART", duration: "4:18" },
    { title: "Демобилизация", artist: "Сектор Газа", duration: "3:25" },
    { title: "Твой звонок", artist: "Сектор Газа", duration: "3:51" },
    { title: "Лирика", artist: "Сектор Газа", duration: "4:02" },
    { title: "Камнем по голове", artist: "КиШ", duration: "3:33" },
    { title: "Охотник", artist: "Король и Шут", duration: "4:15" },
    { title: "Пиво-Пиво-Пиво", artist: "КняZz", duration: "3:28" },
    { title: "Лесник", artist: "Король и Шут", duration: "5:44" },
    { title: "Танец злобного гения", artist: "Король и Шут", duration: "4:21" },
    { title: "Кукла колдуна", artist: "Король и Шут", duration: "4:07" },
    { title: "Дагон", artist: "Король и Шут", duration: "3:55" },
    { title: "Прыгну со скалы", artist: "Король и Шут", duration: "4:33" },
    { title: "Бомж", artist: "Сектор Газа", duration: "2:58" },
    { title: "Дурак и молния", artist: "Король и Шут", duration: "4:12" },
    { title: "Музыка нас связала", artist: "Мираж", duration: "3:47" },
    { title: "Komarovo (DVRST Phonk Remix)", artist: "DVRST, Игорь Скляр, Atomic Heart", duration: "2:33" },
    { title: "Всё, что касается", artist: "Звери", duration: "4:28" }
  ]);

  // Audio controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      nextTrack();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = playlist[currentTrack];
    if (track.url) {
      audio.src = track.url;
    } else if (track.file) {
      audio.src = URL.createObjectURL(track.file);
    }

    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentTrack, playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const playTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % playlist.length;
    setCurrentTrack(next);
  };

  const prevTrack = () => {
    const prev = (currentTrack - 1 + playlist.length) % playlist.length;
    setCurrentTrack(prev);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const audioFiles = Array.from(files).filter(file => 
      file.type.startsWith('audio/')
    );

    const newTracks: Track[] = audioFiles.map(file => ({
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Локальный файл",
      duration: "0:00",
      file: file
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            🎵 Русский Рок Плейлист
          </h1>
          <p className="text-gray-400 text-center">18 треков • Классика русского рока</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Playlist */}
        <div className="flex-1">
          <Card className="bg-[#2D2D2D] border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Треки</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUpload(!showUpload)}
                    className="bg-[#FF6B35] hover:bg-[#FF8555] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Icon name="Upload" size={16} />
                    {showUpload ? 'Скрыть' : 'Загрузить'}
                  </button>
                </div>
              </div>

              {showUpload && (
                <div 
                  className="mb-4 p-6 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-[#FF6B35] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-[#FF6B35]');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-[#FF6B35]');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-[#FF6B35]');
                    handleFileUpload(e.dataTransfer.files);
                  }}
                >
                  <Icon name="Upload" size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-400">
                    Перетащите аудио файлы сюда или кликните для выбора
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Поддерживаются: MP3, WAV, OGG, M4A
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <div 
                    key={index}
                    onClick={() => playTrack(index)}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-[#3A3A3A] ${
                      currentTrack === index ? 'bg-[#FF6B35] hover:bg-[#FF6B35]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {currentTrack === index && isPlaying ? (
                        <Icon name="Pause" size={16} className="text-white" />
                      ) : (
                        <span className="text-sm text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium ${currentTrack === index ? 'text-white' : 'text-gray-200'}`}>
                        {track.title}
                      </div>
                      <div className={`text-sm ${currentTrack === index ? 'text-gray-200' : 'text-gray-400'}`}>
                        {track.artist}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`text-sm ${currentTrack === index ? 'text-gray-200' : 'text-gray-400'}`}>
                        {track.duration}
                      </div>
                      {(track.url || track.file) && (
                        <Icon name="Volume2" size={12} className="text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Player Sidebar */}
        <div className="w-80">
          <Card className="bg-[#2D2D2D] border-gray-700 sticky top-6">
            <div className="p-6">
              {/* Current Track Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B35] to-[#FF8555] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Icon name="Music" size={32} className="text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">
                  {playlist[currentTrack].title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {playlist[currentTrack].artist}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div 
                  className="w-full bg-gray-700 rounded-full h-1 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="bg-[#FF6B35] h-1 rounded-full transition-all duration-100"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{duration ? formatTime(duration) : playlist[currentTrack].duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button 
                  onClick={prevTrack}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon name="SkipBack" size={20} />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="bg-[#FF6B35] hover:bg-[#FF8555] text-white rounded-full p-3 transition-colors"
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                </button>
                
                <button 
                  onClick={nextTrack}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon name="SkipForward" size={20} />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Icon name="Volume2" size={16} className="text-gray-400" />
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-xs text-gray-400 w-8">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Audio element */}
      <audio 
        ref={audioRef}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio) {
            setDuration(audio.duration);
          }
        }}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio) {
            setCurrentTime(audio.currentTime);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          nextTrack();
        }}
      />


    </div>
  );
};

export default Index;