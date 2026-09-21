export interface DemoAsset {
  asset_id: string;
  asset_name: string;
  asset_type: string;
  tag_type: string;
  tag_uid_redacted: string;
  source: string;
  location: string;
  owner: string;
  authorization_scope: string;
  captured_by: string;
  captured_at: string;
  notes: string;
  lims_bot_summary: string;
}

export function pickLatestAsset(assets: DemoAsset[]): DemoAsset {
  if (assets.length === 0) {
    throw new Error("Cannot pick the latest asset from an empty array.");
  }

  return assets.reduce((latest, asset) =>
    Date.parse(asset.captured_at) > Date.parse(latest.captured_at)
      ? asset
      : latest
  );
}
