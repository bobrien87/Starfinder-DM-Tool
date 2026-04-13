import React from 'react';
import Button from '../components/Button';
import NavigationIcon from '../components/NavigationIcon';
import StatPill from '../components/StatPill';
import ActionIcon from '../components/ActionIcon';
import SingleD20Icon from '../components/SingleD20Icon';
import SingleD12Icon from '../components/SingleD12Icon';
import SingleD10Icon from '../components/SingleD10Icon';
import SingleD8Icon from '../components/SingleD8Icon';
import SingleD6Icon from '../components/SingleD6Icon';
import SingleD4Icon from '../components/SingleD4Icon';
import StrikeActionGroup from '../components/StrikeActionGroup';
import EntityLevelBadge from '../components/EntityLevelBadge';

function GuideSection({ title, children }) {
  return (
    <div className="flex flex-col gap-4">
      <h3>
        {title}
      </h3>
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

function GuideItem({ name, description, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <span className="text-primary font-headline tracking-widest text-sm">{name}</span>
        <span className="text-xs opacity-60 italic">{description}</span>
      </div>
      <div className="p-4 bg-black/20 border-l-2 border-tertiary flex flex-wrap items-center gap-4">
        {children}
      </div>
    </div>
  );
}

function ColorBlock({ color, hex, name, description }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 shrink-0 border border-outline-variant/20 shadow-lg`} style={{ backgroundColor: hex }}></div>
      <div className="flex flex-col">
        <span className="text-sm text-primary font-headline tracking-widest">{name}</span>
        <span className="text-xs tracking-widest opacity-80 uppercase">{hex}</span>
        <span className="text-xs opacity-60 italic mt-0.5">{description}</span>
      </div>
    </div>
  );
}

export default function StyleGuide() {
  return (
    <main className="ml-0 mt-0 p-6 flex-1 w-full overflow-y-scroll bg-transparent flex flex-col gap-8 pb-20">
      
      <div className="flex flex-col border-b pb-4 border-tertiary/30 mb-2">
        <h1>Interface Style Guide</h1>
        <p className="text-off-white font-label text-xs tracking-widest opacity-70">A living document of all active UI components and layouts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
        
        {/* TYPOGRAPHY */}
        <GuideSection title="I. TYPOGRAPHY">
          <GuideItem name="<H1> Tag (App Anchors)" description="Typically mapped globally at text-3xl or text-2xl. Primary Red, uppercase.">
            <h1>Creature Bestiary</h1>
          </GuideItem>
          
          <GuideItem name="<H2> Tag (Component Headers)" description="Core structural headers defined safely in index.css @layer base.">
            <h2>Core Specifications</h2>
          </GuideItem>
          
          <GuideItem name="<H3> Tag (Card Headers)" description="Minor dividers wrapping inline stat cards natively tracking neon shadows.">
            <h3>Basic Actions</h3>
          </GuideItem>

          <GuideItem name="<H4> Tag (Inline Dividers)" description="Used strictly inside structural blocks dropping the neon blur and shifting primary.">
            <h4 className="text-off-white font-headline tracking-widest text-sm border-b pb-2 border-tertiary/30 w-full mb-0">Armor Profile</h4>
          </GuideItem>

          <GuideItem name="Body Text (<p>)" description="Standard flex layouts inside dropdowns using text-sm and body mapping.">
            <p className="text-sm text-off-white font-[600]/90 leading-relaxed font-body">This creature can see perfectly in complete darkness out to 60 feet, traversing the vacuum of space natively.</p>
          </GuideItem>

          <GuideItem name="Labels" description="Strictly utilized on form inputs mapping font-label.">
            <label className="text-xs tracking-widest uppercase font-label opacity-70">Health Points</label>
          </GuideItem>
        </GuideSection>

        {/* COLORS */}
        <GuideSection title="II. CORE COLOR PALETTE">
          <ColorBlock hex="#57e6ef" name="Primary (Cyan)" description="The core text color for standard content and primary typography elements. Maps natively to 'text-primary' strings in tailwind." />
          <ColorBlock hex="#ef574e" name="Secondary (Red)" description="Accent layout tracking highlighting, interactive tokens, and sub-headers. Maps natively to 'text-secondary'." />
          <ColorBlock hex="#812b2d" name="Tertiary (Burgundy)" description="Heavily deployed against all border overlays, list dividers, and component boundaries. Maps to 'border-tertiary'." />
          <ColorBlock hex="#12111A" name="Component Surface (Matte)" description="The core background shading of interactables (e.g. abilities, attacks, and StatPills) floating gently against the gradient page backing." />
          <ColorBlock hex="#1A1A24" name="Hover Surface (Matte Lifted)" description="A 1:1 replacement for #12111A deployed specifically on CSS :hover states representing interactive depth." />
          <ColorBlock hex="#1df283" name="Accent (Green)" description="Bright highlight accent green mapped explicitly to tailwind 'accent-green'." />
          <ColorBlock hex="#fad23f" name="Accent (Yellow)" description="Bright highlight accent yellow mapped explicitly to tailwind 'accent-yellow'." />
          <ColorBlock hex="#FCFAED" name="Off-White" description="Base neutral used for extensive paragraphs, text descriptions, and H4 dividers to improve readability against cyan fatigue." />
          
          <div className="flex flex-col gap-2 mt-2 border border-tertiary/30 p-4 bg-gradient-to-b from-[#2E181B] to-[#0D1216]">
            <span className="text-sm text-primary font-headline tracking-widest">Global Page Backing</span>
            <span className="text-xs tracking-widest opacity-80">GRADIENT</span>
            <span className="text-xs opacity-60 italic mt-0.5">Top: #2E181B | Bottom: #0D1216</span>
          </div>
        </GuideSection>

        {/* INTERACTIVE COMPONENTS */}
        <GuideSection title="III. INTERACTIVE UI COMPONENTS">
          <GuideItem name="Button.jsx (Primary)" description="The primary engagement vector natively trapping geometry clips and SVG layer shadowing.">
            <Button variant="primary">Accept Change</Button>
          </GuideItem>
          
          <GuideItem name="Button.jsx (Inverse Primary)" description="Inverse pseudo-element hover physics using primary borders mapped alongside secondary core typography.">
            <Button variant="inverse_primary">Deny Change</Button>
          </GuideItem>
          
          <GuideItem name="Button.jsx (Secondary)" description="A passive hollow boundary action typically deployed alongside primary operators.">
            <Button variant="secondary" icon="refresh">Refresh Layout</Button>
            <Button variant="secondary" icon="delete" title="Icon Only Test" />
          </GuideItem>
          
          <GuideItem name="Button.jsx (Tertiary)" description="Ghost action utilized rarely for silent text-driven UI loops.">
            <Button variant="tertiary">Cancel Request</Button>
          </GuideItem>
          
          <GuideItem name="NavigationIcon.jsx" description="Interactive, glowing mechanical keyboard key used for header navigation and floating tools.">
            <div className="flex gap-4 items-center bg-black/40 p-4 border border-outline-variant/10 rounded">
                <NavigationIcon icon="notifications" title="Standard Icon" />
                <NavigationIcon icon={<SingleD20Icon className="w-5 h-5 text-primary" />} title="SVG Sub-Icon" />
                <NavigationIcon icon="settings" disabled={true} title="Disabled Icon" />
            </div>
          </GuideItem>

          <GuideItem name="StatPill.jsx" description="Universal layout pill highlighting generic flat stat matrices.">
            <StatPill variant="primary">Primary</StatPill>
            <StatPill variant="secondary">Secondary</StatPill>
            <StatPill prefix="+">15</StatPill>
          </GuideItem>
          
          <GuideItem name="StrikeActionGroup.jsx" description="Hardcoded weapon attack generator visualizing strike arrays dynamically inside statblocks.">
            <StrikeActionGroup name="Tactical Baton" attackBonus={12} damage="1d4 b" traits={["Agile", "Operative"]} label="Melee" theme="primary" />
          </GuideItem>

          <GuideItem name="EntityLevelBadge.jsx" description="Statistically accurate level indicator used primarily on active creature overlay layouts.">
            <div className="flex justify-start">
              <EntityLevelBadge level={3} />
            </div>
          </GuideItem>
        </GuideSection>

        {/* NATIVE SVGS & BOUNDARIES */}
        <GuideSection title="IV. SVG & STRUCTURAL ELEMENTS">
          <GuideItem name="ActionIcon.jsx" description="Dynamic SVG layout interceptor strictly tracking generic Starfinder action economies.">
            <div className="flex gap-4 items-center">
              <span className="flex items-center gap-2"><ActionIcon action="1" className="h-5 text-off-white" /> (1)</span>
              <span className="flex items-center gap-2"><ActionIcon action="2" className="h-5 text-off-white" /> (2)</span>
              <span className="flex items-center gap-2"><ActionIcon action="3" className="h-5 text-off-white" /> (3)</span>
              <span className="flex items-center gap-2"><ActionIcon action="reaction" className="h-5 text-off-white" /> (R)</span>
              <span className="flex items-center gap-2"><ActionIcon action="free" className="h-5 text-off-white" /> (F)</span>
            </div>
            <div className="flex items-center gap-2 w-full mt-2">
              <span className="text-xs opacity-60">Variable Hook: </span> <ActionIcon action="1 to 3" className="h-5 text-off-white" />
            </div>
          </GuideItem>
          
          <GuideItem name="Polyhedral Dice Elements" description="Base structural SVG geometry mapping standard D20 tabletop mathematical arrays.">
            <div className="flex gap-4 items-center">
              <SingleD20Icon className="h-8 w-auto text-primary" />
              <SingleD12Icon className="h-8 w-auto text-primary" />
              <SingleD10Icon className="h-8 w-auto text-primary" />
              <SingleD8Icon className="h-8 w-auto text-primary" />
              <SingleD6Icon className="h-8 w-auto text-primary" />
              <SingleD4Icon className="h-8 w-auto text-primary" />
            </div>
          </GuideItem>

          <GuideItem name="Dropdown Frame (Generic)" description="The current exact UI spec for expanding element data dynamically.">
            <div className="w-full">
              <details className="group transition-all w-full">
                <summary className="p-2.5 px-3 flex items-center justify-between border-t-2 border-primary/70 bg-[#12111A] hover:bg-[#1A1A24] transition-colors cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden min-h-[44px]">
                  <span className="text-sm text-off-white font-[500]">Expandable Title</span>
                  <span className="material-symbols-outlined text-primary opacity-50 group-open:rotate-180 transition-transform text-[20px]">expand_more</span>
                </summary>
                <div className="p-4 bg-black/20 text-sm text-off-white font-[600]/90 leading-relaxed font-body">
                  <strong className="text-secondary [text-shadow:0_0_3px_rgba(239,87,78,0.2)] font-[600] font-headline">Parsed Highlight:</strong> This element strictly inherits no background class outside of black-lightening!
                </div>
              </details>
            </div>
          </GuideItem>

          <GuideItem name="Hardware Scrollbar Array" description="An enforced macOS hardware track simulating the main Active Encounter layout loop.">
            <div className="h-32 w-full border border-tertiary/30 bg-black/20 overflow-y-scroll p-4 flex flex-col gap-4">
              <p>Line Block 1</p>
              <p>Line Block 2</p>
              <p>Line Block 3</p>
              <p>Line Block 4</p>
              <p>Line Block 5</p>
              <p>Line Block 6</p>
            </div>
          </GuideItem>
        </GuideSection>

        {/* MODAL ARCHITECTURE */}
        <GuideSection title="V. MODAL ARCHITECTURE">
          <GuideItem name="Standard Modal Frame Layout" description="The core gradient boundary box used for settings, conditions, and generic UI overlays.">
             <div className="relative w-[340px] h-[300px] bg-gradient-to-b from-[#2E181B] to-[#0D1216] border border-tertiary flex flex-col p-6 shadow-2xl">
               <div className="px-4 py-2 flex justify-center items-center relative border-b border-tertiary/30 bg-black/20 absolute top-0 left-0 right-0 h-12">
                 <h2 className="flex items-center gap-2 m-0 pointer-events-none text-base">
                   Example Modal
                 </h2>
               </div>
               <div className="mt-16 flex flex-col gap-4 items-center justify-center flex-1">
                 <p className="text-sm font-label text-off-white/80 text-center">Content block mounts dynamically here inside the bounding architecture.</p>
                 <Button variant="primary" className="w-full">Initialize</Button>
               </div>
             </div>
          </GuideItem>
        </GuideSection>

      </div>
    </main>
  );
}
