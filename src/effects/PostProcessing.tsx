import { useShowcaseStore } from '../store/showcaseStore'
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, SMAA } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function PostProcessing({ children }: { children?: React.ReactNode }) {
  const { features } = useShowcaseStore()

  const passChildren: React.ReactElement[] = []
  if (children) passChildren.push(children as React.ReactElement)
  if (features.bloom) passChildren.push(<Bloom key="bloom" luminanceThreshold={0.3} luminanceSmoothing={0.02} intensity={1.0} mipmapBlur />)
  if (features.dof) passChildren.push(<DepthOfField key="dof" focusDistance={0.01} focalLength={0.08} bokehScale={6} />)
  if (features.chromaticAberration) passChildren.push(<ChromaticAberration key="ca" blendFunction={BlendFunction.NORMAL} offset={[0.003, 0.001]} />)
  passChildren.push(<SMAA key="smaa" />)

  return (
    <EffectComposer>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {passChildren as any}
    </EffectComposer>
  )
}
