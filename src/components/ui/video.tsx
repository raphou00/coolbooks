"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Video } from "@prisma/client";
import VideoPlayer from "react-player";
import screenfull from "screenfull";
import { Fullscreen, Pause, Play } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

type VideoProps = {
    video: Video;
    bought: boolean;
    description: string;
};

type ThumbnailProps = {
    src: string;
    width: number;
    height: number;
    description: string;
};

const VideoEl: React.FC<VideoProps> = ({ video, description }) => {
    const videoPlayer = useRef<VideoPlayer>(null);
    const [showPanel, setShowPanel] = useState<boolean>(false);
    const [playing, setPlaying] = useState<boolean>(true);
    const [track, setTrack] = useState<number>(0);

    const handlePlay = () => {
        setPlaying((e) => !e);
    };

    const handleFullscreen = () => {
        screenfull.request(document.querySelector(".video-player") as Element);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        videoPlayer.current?.seekTo(v);
        setTrack(v);
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowPanel(true)}
            onMouseLeave={() => setShowPanel(false)}
        >
            <VideoPlayer
                ref={videoPlayer}
                url={video.src}
                light={
                    <Thumbnail
                        src={video.thumbnail}
                        width={video.width}
                        height={video.height}
                        description={description}
                    />
                }
                width="100%"
                height="100%"
                className="video-player w-full h-full rounded-xl"
                playIcon={
                    <div className="absolute flex items-center justify-center size-10 bg-secondary/50 rounded-full">
                        <Play className="fill-white" />
                    </div>
                }
                playing={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onProgress={(e) => setTrack(e.playedSeconds)}
            />
            <div
                className={cn(
                    "p-2 w-full absolute bottom-0 opacity-0 transition-all",
                    (showPanel || !playing) && "opacity-100"
                )}
            >
                <div className="flex items-center w-full p-1 space-x-2 bg-base-200 rounded-xl">
                    <button
                        className="btn btn-sm btn-ghost btn-square rounded-md"
                        onClick={handlePlay}
                    >
                        {playing ?
                            <Pause className="fill-white" />
                        :   <Play className="fill-white" />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={video.time}
                        step={0.01}
                        value={track}
                        onChange={handleSeek}
                        className="px-2 range range-xs range-secondary rounded-full"
                    />
                    <span className="flex items-center gap-x-1 font-mono">
                        {formatDuration(track)}
                        <div>/</div>
                        {formatDuration(video.time)}
                    </span>
                    <button
                        className="btn btn-sm btn-ghost btn-square rounded-md"
                        onClick={handleFullscreen}
                    >
                        <Fullscreen />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Thumbnail: React.FC<ThumbnailProps> = ({
    src,
    width,
    height,
    description,
}) => {
    return (
        <Image
            src={src}
            alt={description}
            width={width}
            height={height}
            className="w-full h-full object-cover"
        />
    );
};

export default VideoEl;
