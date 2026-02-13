import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
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
          borderRadius: '36px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            border: '15px solid white',
            borderRadius: '50%',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            background: 'white',
            borderRadius: '50%',
            top: '40px',
            right: '40px',
            boxShadow: '0 0 40px white',
          }}
        />
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
