import * as anchor from '@coral-xyz/anchor';
import BN from 'bn.js';  // 从 bn.js 模块导入 BN
import dotenv from 'dotenv';
dotenv.config();

// 自动加载环境变量中的 provider 配置
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// 这里程序名称必须与 Anchor.toml 中定义的 key 一致
const program = anchor.workspace.raydium_cp_swap;
console.log("当前程序ID：", program.programId.toBase58());

// 示例参数
const index = 1; // u16 类型的 index
const tradeFeeRate = new BN(5000);       // 示例交易手续费率
const protocolFeeRate = new BN(1000);      // 示例协议手续费率
const fundFeeRate = new BN(2000);          // 示例资金手续费率
const createPoolFee = new BN(1000000);     // 示例创建池的费用

// 计算 amm_config 账户的 PDA，种子与程序端保持一致
// async function getAmmConfigPDA(index) {
//   const seed1 = Buffer.from("amm_config");
//   const seed2 = Buffer.from(new BN(index).toArrayLike(Buffer, 'le', 8));
//   return await anchor.web3.PublicKey.findProgramAddress(
//     [seed1, seed2],
//     program.programId
//   );
// }
async function getAmmConfigPDA(index) {
  const seed1 = Buffer.from("amm_config");
  // 使用 'be' 表示大端，并且长度设为 2 个字节（u16）
  const seed2 = Buffer.from(new BN(index).toArrayLike(Buffer, 'be', 2));
  return await anchor.web3.PublicKey.findProgramAddress(
    [seed1, seed2],
    program.programId
  );
}

(async () => {
  // 计算 amm_config PDA
  const [ammConfigPDA, bump] = await getAmmConfigPDA(index);
  console.log("计算得到的 amm_config PDA：", ammConfigPDA.toBase58());

  try {
    // 调用 create_amm_config 指令
    const tx = await program.methods
      .createAmmConfig(
        index,
        tradeFeeRate,
        protocolFeeRate,
        fundFeeRate,
        createPoolFee
      )
      .accounts({
        ammConfig: ammConfigPDA,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        // 如果 Context 中有其他必填账户，也一并填写
      })
      .rpc();
    console.log("createAmmConfig 交易签名：", tx);
  } catch (err) {
    console.error("调用 createAmmConfig 出错：", err);
  }
})();

