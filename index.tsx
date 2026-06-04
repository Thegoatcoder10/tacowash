import { GameProvider, useGame } from '@/game/store';
import TitleScreen from '@/components/game/TitleScreen';
import BackstoryScreen from '@/components/game/BackstoryScreen';
import StreetScene from '@/components/game/StreetScene';
import WindowWashMinigame from '@/components/game/WindowWashMinigame';
import DialogueBox from '@/components/game/DialogueBox';
import ShopModal from '@/components/game/ShopModal';
import DayEndReport from '@/components/game/DayEndReport';
import WorldMap from '@/components/game/WorldMap';
import TrainingArc from '@/components/game/TrainingArc';
import HUD from '@/components/game/HUD';
import Championship from '@/components/game/Championship';
import Ending from '@/components/game/Ending';
import SaveSlots from '@/components/game/SaveSlots';

function GameRoot() {
  const { state } = useGame();
  const { screen } = state;

  const showHUD = screen !== 'title' && screen !== 'backstory' && screen !== 'dayend' && screen !== 'ending';
  const showDialogue = screen === 'dialogue';

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#020408' }}>
      {screen === 'title' && <TitleScreen />}
      {screen === 'backstory' && <BackstoryScreen />}
      {(screen === 'street' || screen === 'dialogue') && <StreetScene />}
      {screen === 'washing' && <WindowWashMinigame />}
      {screen === 'shop' && <ShopModal />}
      {screen === 'dayend' && <DayEndReport />}
      {screen === 'worldmap' && <WorldMap />}
      {screen === 'cruise' && <TrainingArc />}
      {screen === 'championship' && <Championship />}
      {screen === 'ending' && <Ending />}

      {showHUD && <HUD />}
      {showDialogue && <DialogueBox />}
      <SaveSlots />
    </div>
  );
}

export default function Index() {
  return (
    <GameProvider>
      <GameRoot />
    </GameProvider>
  );
}
