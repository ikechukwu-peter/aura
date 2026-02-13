import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'linear-gradient(to bottom right, #8b5cf6, #06b6d4)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '3px solid white',
            borderRadius: '50%',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            background: 'white',
            borderRadius: '50%',
            top: '8px',
            right: '8px',
            boxShadow: '0 0 10px white',
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
