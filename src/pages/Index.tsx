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

  const [playlist, setPlaylist] = useState<Track[]>([]);

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
            🎵 Мой Музыкальный Плейлист
          </h1>
          <p className="text-gray-400 text-center">
            {playlist.length === 0 ? 'Загрузите музыку для начала' : `${playlist.length} треков в плейлисте`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Playlist */}
        <div className="flex-1">
          <Card className="bg-[#2D2D2D] border-gray-700">
            <div className="p-6">
              {playlist.length === 0 ? (
                <div className="text-center py-12">
                  <div 
                    className="mb-8 p-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#FF6B35] transition-colors"
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
                    <Icon name="Music" size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Добавьте музыку в плейлист
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Перетащите аудио файлы сюда или кликните для выбора
                    </p>
                    <div className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#FF8555] text-white px-6 py-3 rounded-lg transition-colors">
                      <Icon name="Upload" size={16} />
                      Выбрать файлы
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Поддерживаются: MP3, WAV, OGG, M4A
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Треки</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#FF6B35] hover:bg-[#FF8555] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Icon name="Plus" size={16} />
                        Добавить
                      </button>
                      <button
                        onClick={() => setPlaylist([])}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Icon name="Trash2" size={16} />
                        Очистить
                      </button>
                    </div>
                  </div>

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
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
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
                {playlist.length > 0 ? (
                  <>
                    <h3 className="font-semibold text-white mb-1">
                      {playlist[currentTrack]?.title || 'Неизвестный трек'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {playlist[currentTrack]?.artist || 'Неизвестный исполнитель'}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-white mb-1">
                      Плейлист пуст
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Добавьте музыку для прослушивания
                    </p>
                  </>
                )}
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
                  <span>{duration ? formatTime(duration) : (playlist[currentTrack]?.duration || '0:00')}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button 
                  onClick={prevTrack}
                  disabled={playlist.length === 0}
                  className={`transition-colors ${playlist.length === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                >
                  <Icon name="SkipBack" size={20} />
                </button>
                
                <button 
                  onClick={togglePlay}
                  disabled={playlist.length === 0}
                  className={`rounded-full p-3 transition-colors ${
                    playlist.length === 0 
                      ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                      : 'bg-[#FF6B35] hover:bg-[#FF8555] text-white'
                  }`}
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                </button>
                
                <button 
                  onClick={nextTrack}
                  disabled={playlist.length === 0}
                  className={`transition-colors ${playlist.length === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
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