/**
 * Kling V2.1 Plugin Usage Example
 *
 * This example demonstrates how to use the Kling V2.1 plugin
 * for video generation from text and images.
 */

import { KieAISDK, KlingV21Plugin, type KlingV21API } from '../src/index';

// Initialize SDK
const sdk = new KieAISDK({
  apiKey: process.env.KIE_API_KEY || 'your-api-key-here',
  baseURL: 'https://api.kie.ai',
});

// Register Kling V2.1 plugin
sdk.use(KlingV21Plugin);

// Get plugin API
const klingAPI = sdk.getPlugin<KlingV21API>('kling-v2-1');

/**
 * Example 1: Master Text-to-Video
 */
async function textToVideoExample() {
  console.log('\n=== Master Text-to-Video Example ===');

  const task = await klingAPI.masterTextToVideo({
    prompt:
      'First-person view from a soldier jumping from a transport plane — the camera shakes with turbulence, oxygen mask reflections flicker — as the clouds part, the battlefield below pulses with anti-air fire and missile trails.',
    duration: '5',
    aspect_ratio: '16:9',
    negative_prompt: 'blur, distort, and low quality',
    cfg_scale: 0.5,
  });

  console.log('Task created:', task.taskId);
  return task.taskId;
}

/**
 * Example 2: Master Image-to-Video
 */
async function masterImageToVideoExample() {
  console.log('\n=== Master Image-to-Video Example ===');

  const task = await klingAPI.masterImageToVideo({
    prompt:
      'A team of paratroopers descends into enemy territory, as they pass through clouds, the camera switches to a slow pan above the battlefield lighting up with',
    image_url:
      'https://file.aiquickdraw.com/custom-page/akr/section-images/1755256297923kmjpynul.png',
    duration: '5',
    negative_prompt: 'blur, distort, and low quality',
    cfg_scale: 0.5,
  });

  console.log('Task created:', task.taskId);
  return task.taskId;
}

/**
 * Example 3: Standard Image-to-Video
 */
async function standardImageToVideoExample() {
  console.log('\n=== Standard Image-to-Video Example ===');

  const task = await klingAPI.standardImageToVideo({
    prompt:
      'Begin with the uploaded image as the first frame. Gradually animate the scene: steam rises and drifts upward from the train; lantern lights flicker subtly; cloaked figures begin to move slowly — walking, turning, adjusting their belongings. Floating dust or magical particles catch the light.',
    image_url:
      'https://file.aiquickdraw.com/custom-page/akr/section-images/1755256596169mkkwr2ag.webp',
    duration: '5',
    negative_prompt: 'blur, distort, and low quality',
    cfg_scale: 0.5,
  });

  console.log('Task created:', task.taskId);
  return task.taskId;
}

/**
 * Example 4: Pro Image-to-Video with tail image
 */
async function proImageToVideoExample() {
  console.log('\n=== Pro Image-to-Video Example ===');

  const task = await klingAPI.proImageToVideo({
    prompt:
      'POV shot of a gravity surfer diving between ancient ruins suspended midair, glowing moss lights the path, the board hisses as it carves through thin mist, echoes rise with speed',
    image_url:
      'https://file.aiquickdraw.com/custom-page/akr/section-images/1754892534386c8wt0qfs.webp',
    duration: '5',
    negative_prompt: 'blur, distort, and low quality',
    cfg_scale: 0.5,
    // tail_image_url: 'https://example.com/end-image.webp', // Optional
  });

  console.log('Task created:', task.taskId);
  return task.taskId;
}

/**
 * Example 5: Poll task status
 */
async function pollTaskStatus(taskId: string) {
  console.log('\n=== Polling Task Status ===');

  let attempts = 0;
  const maxAttempts = 60; // Poll for up to 5 minutes

  while (attempts < maxAttempts) {
    const record = await klingAPI.getTaskRecord(taskId);

    console.log(`[Attempt ${attempts + 1}] Status: ${record.state}`);

    if (record.state === 'success') {
      console.log('\n✅ Video generation completed!');
      console.log('Video URLs:', record.result?.resultUrls);
      console.log('Cost time:', record.costTime, 'ms');
      console.log('Completed at:', new Date(record.completeTime!).toISOString());
      return record;
    }

    if (record.state === 'fail') {
      console.error('\n❌ Video generation failed!');
      console.error('Error code:', record.failCode);
      console.error('Error message:', record.failMsg);
      return record;
    }

    // Wait 5 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 5000));
    attempts++;
  }

  console.error('\n⏱️  Polling timeout - task is still processing');
  return null;
}

/**
 * Example 6: Using callback URL
 */
async function callbackExample() {
  console.log('\n=== Callback Example ===');

  const task = await klingAPI.masterTextToVideo({
    prompt: 'A beautiful sunset over the ocean',
    duration: '5',
    callBackUrl: 'https://your-domain.com/api/callback',
  });

  console.log('Task created with callback:', task.taskId);
  console.log(
    'When the task completes, a POST request will be sent to your callback URL'
  );

  return task.taskId;
}

/**
 * Main function to run examples
 */
async function main() {
  try {
    console.log('🚀 Kling V2.1 Plugin Examples\n');

    // Uncomment the example you want to run:

    // Example 1: Text to Video
    // const taskId = await textToVideoExample();

    // Example 2: Master Image to Video
    const taskId = await masterImageToVideoExample();

    // Example 3: Standard Image to Video
    // const taskId = await standardImageToVideoExample();

    // Example 4: Pro Image to Video
    // const taskId = await proImageToVideoExample();

    // Example 6: With Callback
    // const taskId = await callbackExample();

    // Poll for results
    if (taskId) {
      await pollTaskStatus(taskId);
    }

    console.log('\n✨ Example completed!');
  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export { main };
