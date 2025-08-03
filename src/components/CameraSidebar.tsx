import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ASCII_CHARS, INITIAL_STATE } from "@/lib/constants";
import { CameraSettings, UseState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronsUp } from "lucide-react";
import { RefObject } from "preact";
import { useState } from "preact/hooks";
import { HexColorInput, HexColorPicker } from "react-colorful";

export default function Sidebar({
  sidebarState: [sidebarOpen, setSidebarOpen],
  settingsRef,
  resizeCanvas,
  asciiModeState: [asciiMode, setAsciiMode],
  renderAscii,
}: {
  sidebarState: UseState<boolean>;
  settingsRef: RefObject<CameraSettings>;
  resizeCanvas: () => void;
  asciiModeState: UseState<boolean>;
  renderAscii: () => void;
}) {
  const [sidebarBtnRotation, setSidebarBtnRotation] = useState(0);
  const [monocolor, setMonocolor] = useState({
    on: !!settingsRef.current!.color,
    color: settingsRef.current!.color,
  });

  function handleColorChange(color: string) {
    settingsRef.current!.color = color;
    setMonocolor((prev) => ({
      ...prev,
      color,
    }));
    resizeCanvas();
  }

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        onClick={() => {
          setSidebarOpen((prev) => !prev);
          setSidebarBtnRotation((r) => r - 180);
        }}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="absolute right-3 bottom-20 z-30 cursor-pointer md:top-3 md:-rotate-90"
      >
        <ChevronsUp
          className="h-6 w-6 text-black transition-transform duration-200"
          style={{ transform: `rotate(${sidebarBtnRotation.toString()}deg)` }}
        />
      </Button>
      <aside
        className={cn(
          "fixed bottom-0 mb-24 flex h-1/2 w-full max-w-full flex-col border-l border-white/10 bg-black transition-transform duration-300 md:top-0 md:right-0 md:h-full md:w-80",
          sidebarOpen
            ? "translate-y-0 md:translate-x-0 md:translate-y-0"
            : "translate-y-full md:translate-x-full md:translate-y-0",
        )}
        style={{ willChange: "transform" }}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <Switch
            checked={asciiMode}
            onCheckedChange={(asciiMode) => {
              settingsRef.current!.asciiMode = asciiMode;
              setAsciiMode(asciiMode);
              resizeCanvas();
              if (asciiMode) {
                renderAscii();
              }
            }}
          />

          <Separator />

          <Select
            onValueChange={(chars: CameraSettings["chars"]) =>
              (settingsRef.current!.chars = chars)
            }
            defaultValue={settingsRef.current?.chars}
          >
            <SelectTrigger className="w-2/3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(ASCII_CHARS).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator />

          <Slider
            onValueChange={([res]) => {
              settingsRef.current!.res = res!;
              resizeCanvas();
            }}
            defaultValue={[settingsRef.current!.res]}
            max={2}
            min={0.5}
            step={0.05}
          />

          <Separator />

          <Slider
            onValueChange={([contrast]) => {
              settingsRef.current!.contrast = contrast!;
              resizeCanvas();
            }}
            defaultValue={[INITIAL_STATE.contrast]}
            max={500}
            min={100}
            step={10}
          />

          <Separator />

          <Slider
            onValueChange={([brightness]) => {
              settingsRef.current!.brightness = brightness!;
              resizeCanvas();
            }}
            defaultValue={[INITIAL_STATE.brightness]}
            max={500}
            min={100}
            step={10}
          />

          <Separator />

          <div>
            <Switch
              checked={monocolor.on}
              onCheckedChange={(on) => {
                settingsRef.current!.color = on ? monocolor.color : undefined;
                setMonocolor((prev) => ({
                  ...prev,
                  on,
                }));
                resizeCanvas();
              }}
            />

            <Popover>
              <PopoverTrigger asChild disabled={!monocolor.on}>
                <Button disabled={!monocolor.on}>Color</Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit">
                <HexColorPicker
                  color={monocolor.color}
                  onChange={handleColorChange}
                />
                <HexColorInput
                  prefixed
                  color={monocolor.color}
                  onChange={handleColorChange}
                  className="mt-2 w-full"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </aside>
    </>
  );
}
