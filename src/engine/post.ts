import { DefaultRenderingPipeline } from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline'
import '@babylonjs/core/PostProcesses/RenderPipeline/postProcessRenderPipelineManagerSceneComponent'
import type { Scene } from '@babylonjs/core/scene'
import type { Engine } from '@babylonjs/core/Engines/engine'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { Quality } from './quality'
/** bloom, edge smoothing and vignette for machines that can afford it */
export class Post { p: DefaultRenderingPipeline
  constructor(scene: Scene, _e: Engine, cam: Camera, q: Quality) { const p = this.p = new DefaultRenderingPipeline('post', false, scene, [cam]); p.samples = q.tier === 'ultra' ? 4 : 2; p.fxaaEnabled = true; p.bloomEnabled = true; p.bloomThreshold = .86; p.bloomWeight = .42; p.bloomKernel = 72; p.bloomScale = .5; p.imageProcessingEnabled = true; p.imageProcessing.toneMappingEnabled = false; p.imageProcessing.vignetteEnabled = true; p.imageProcessing.vignetteWeight = 1.6; p.imageProcessing.vignetteStretch = .4; p.imageProcessing.contrast = 1.06; p.imageProcessing.exposure = 1; (p.imageProcessing as any).fromLinearSpace = false }
}
