-- CreateTable
CREATE TABLE `clientes_config_ia` (
    `id_config_ia` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `prompt_personalizado` LONGTEXT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `dt_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clientes_config_ia_id_usuario_key`(`id_usuario`),
    PRIMARY KEY (`id_config_ia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asaas_clientes` (
    `id_usuario_asaas` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `id_externo_cliente` VARCHAR(191) NOT NULL,
    `cpf_cnpj` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `logradouro` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `numero` VARCHAR(191) NULL,

    UNIQUE INDEX `asaas_clientes_id_usuario_key`(`id_usuario`),
    UNIQUE INDEX `asaas_clientes_id_externo_cliente_key`(`id_externo_cliente`),
    PRIMARY KEY (`id_usuario_asaas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas_construcao` (
    `id_empresa_construcao` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `dt_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `empresas_construcao_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id_empresa_construcao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas_construcao_usuarios` (
    `id_empresa_construcao` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id_empresa_construcao`, `id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_evolution` (
    `id_config_evolution` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `nome_instancia` VARCHAR(191) NOT NULL,
    `id_instancia` VARCHAR(191) NULL,
    `qr_code` LONGTEXT NULL,
    `conectado` BOOLEAN NOT NULL DEFAULT false,
    `telefone` VARCHAR(191) NULL,
    `dt_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `config_evolution_id_usuario_key`(`id_usuario`),
    UNIQUE INDEX `config_evolution_nome_instancia_key`(`nome_instancia`),
    PRIMARY KEY (`id_config_evolution`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `features` (
    `id_feature` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_feature` VARCHAR(191) NOT NULL,
    `administrador_sistema` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_feature`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leads` (
    `id_lead` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `origem` ENUM('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'GOOGLE', 'WHATSAPP', 'OTHER') NOT NULL DEFAULT 'WHATSAPP',
    `etapa` ENUM('QUALIFICATION', 'CADENCE', 'VISITATION', 'PROPOSAL', 'CONTRACT', 'WIN', 'LOSS') NOT NULL DEFAULT 'QUALIFICATION',
    `ia_ativa` BOOLEAN NOT NULL DEFAULT true,
    `dt_ultima_resposta` DATETIME(3) NULL,
    `dt_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `leads_id_usuario_telefone_key`(`id_usuario`, `telefone`),
    PRIMARY KEY (`id_lead`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imovel_leads` (
    `id_lead_imovel` VARCHAR(191) NOT NULL,
    `id_lead` VARCHAR(191) NOT NULL,
    `id_imovel` VARCHAR(191) NOT NULL,
    `interesse` TEXT NULL,
    `dt_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `imovel_leads_id_lead_id_imovel_key`(`id_lead`, `id_imovel`),
    PRIMARY KEY (`id_lead_imovel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id_mensagem` VARCHAR(191) NOT NULL,
    `id_lead` VARCHAR(191) NOT NULL,
    `remetente` ENUM('LEAD', 'AI', 'BROKER') NOT NULL,
    `conteudo` LONGTEXT NOT NULL,
    `url_midia` VARCHAR(191) NULL,
    `intent` ENUM('GREETING', 'GENERIC_INTEREST', 'INTEREST_WITH_FILTERS', 'REQUEST_FOR_OPTIONS', 'ANALYZING_SPECIFIC_PROPERTY', 'COMPARING_PROPERTIES', 'REQUEST_FOR_DETAILS', 'REQUEST_FOR_PHOTOS', 'REQUEST_FOR_SCHEDULING', 'FINANCIAL_QUESTION', 'NEGOTIATION', 'OTHER') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `messages_id_lead_createdAt_idx`(`id_lead`, `createdAt`),
    PRIMARY KEY (`id_mensagem`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recuperacao_senhas` (
    `id_reset_senha` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `dt_expiracao` DATETIME(3) NOT NULL,
    `utilizada` BOOLEAN NOT NULL DEFAULT false,
    `dt_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_reset_senha`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id_pagamento` VARCHAR(191) NOT NULL,
    `id_assinatura` VARCHAR(191) NOT NULL,
    `id_pagamento_asaas` VARCHAR(191) NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'OVERDUE', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `dt_pagamento` DATETIME(3) NULL,
    `dt_vencimento` DATETIME(3) NOT NULL,
    `dt_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_pagamento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planos` (
    `id_plano` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `valor` DECIMAL(7, 2) NOT NULL,

    PRIMARY KEY (`id_plano`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planos_features` (
    `id_plano` VARCHAR(191) NOT NULL,
    `id_feature` INTEGER NOT NULL,

    PRIMARY KEY (`id_plano`, `id_feature`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imoveis` (
    `id_imovel` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `quartos` INTEGER NULL,
    `qtd_garagens` INTEGER NULL,
    `tipo_garagem` ENUM('COVERED', 'UNCOVERED') NULL,
    `banheiros` INTEGER NULL,
    `churrasqueira` ENUM('NONE', 'COAL', 'ELETRIC') NOT NULL DEFAULT 'NONE',
    `descricao` LONGTEXT NULL,
    `area_privativa` DECIMAL(7, 2) NULL,
    `modo` ENUM('UNIC', 'MILTIPLE') NOT NULL DEFAULT 'UNIC',
    `prop_objetivo` VARCHAR(191) NULL DEFAULT 'venda',
    `tipo` VARCHAR(191) NULL,
    `bairro` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `dt_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_atualizacao` DATETIME(3) NOT NULL,
    `dt_exclusao` DATETIME(3) NULL,
    `valor_total` DECIMAL(13, 2) NULL,
    `valor_minimo_desc` DECIMAL(13, 2) NULL,
    `parcelas` INTEGER NULL,
    `reforco_anual` DECIMAL(13, 2) NULL,
    `valor_parcela` DECIMAL(13, 2) NULL,
    `condicoes_pagamento` TEXT NULL,
    `opcoes_pagamento` TEXT NULL,

    PRIMARY KEY (`id_imovel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imovel_ads_links` (
    `id_link_anuncio` VARCHAR(191) NOT NULL,
    `id_imovel` VARCHAR(191) NOT NULL,
    `plataforma` VARCHAR(191) NOT NULL,
    `id_anuncio` VARCHAR(191) NULL,
    `url` VARCHAR(191) NULL,
    `dt_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_link_anuncio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imovel_imagens` (
    `id_imagem_imovel` VARCHAR(191) NOT NULL,
    `id_imovel` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `ordenacao` INTEGER NOT NULL DEFAULT 0,
    `dt_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_imagem_imovel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imovel_unidades` (
    `id_unidade_imovel` VARCHAR(191) NOT NULL,
    `id_imovel` VARCHAR(191) NOT NULL,
    `nome_unidade` VARCHAR(191) NOT NULL,
    `quartos` INTEGER NULL,
    `garagens` INTEGER NULL,
    `area_privativa` DECIMAL(8, 2) NULL,
    `area_garagens` DECIMAL(8, 2) NULL,
    `area_total` DECIMAL(8, 2) NULL,
    `valor_entrada` DECIMAL(13, 2) NULL,
    `reforco_anual` DECIMAL(13, 2) NULL,
    `valor_parcela` DECIMAL(13, 2) NULL,
    `dt_exclusao` DATETIME(3) NULL,

    PRIMARY KEY (`id_unidade_imovel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `corretores_imovel` (
    `id_corretor` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `creci` VARCHAR(191) NOT NULL,
    `telefone_comercial` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,

    UNIQUE INDEX `corretores_imovel_id_usuario_key`(`id_usuario`),
    UNIQUE INDEX `corretores_imovel_creci_key`(`creci`),
    UNIQUE INDEX `corretores_imovel_cnpj_key`(`cnpj`),
    UNIQUE INDEX `corretores_imovel_id_usuario_creci_key`(`id_usuario`, `creci`),
    PRIMARY KEY (`id_corretor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_keys` (
    `id_refresh` VARCHAR(191) NOT NULL,
    `id_usuario` VARCHAR(191) NOT NULL,
    `data_expiracao` DATETIME(3) NOT NULL,
    `ip_origem` VARCHAR(191) NOT NULL,
    `token_atual` TEXT NOT NULL,

    PRIMARY KEY (`id_refresh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assinaturas` (
    `id_assinatura` VARCHAR(191) NOT NULL,
    `id_corretor` VARCHAR(191) NULL,
    `id_construtora` VARCHAR(191) NULL,
    `status` ENUM('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'TRIAL',
    `dt_inicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_expiracao` DATETIME(3) NOT NULL,
    `id_assinatura_asaas` VARCHAR(191) NULL,
    `id_plano` VARCHAR(191) NOT NULL,
    `dt_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assinaturas_id_corretor_key`(`id_corretor`),
    PRIMARY KEY (`id_assinatura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_modulos` (
    `id_modulo` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_modulo` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(7, 2) NOT NULL DEFAULT 0,

    PRIMARY KEY (`id_modulo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_modulos_features` (
    `id_modulo` INTEGER NOT NULL,
    `id_feature` INTEGER NOT NULL,

    PRIMARY KEY (`id_modulo`, `id_feature`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configs_sistema` (
    `id_config_sistema` VARCHAR(191) NOT NULL,
    `chave` VARCHAR(191) NOT NULL,
    `valor` LONGTEXT NOT NULL,

    UNIQUE INDEX `configs_sistema_chave_key`(`chave`),
    PRIMARY KEY (`id_config_sistema`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NULL,
    `perfil` ENUM('CLIENT', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `provedor` ENUM('LOCAL', 'GOOGLE', 'FACEBOOK') NOT NULL DEFAULT 'LOCAL',
    `id_provedor` VARCHAR(191) NULL,
    `telefone_comercial` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `url_img_perfil` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `dt_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dt_atualizacao` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `usuarios_cpf_key`(`cpf`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clientes_config_ia` ADD CONSTRAINT `clientes_config_ia_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asaas_clientes` ADD CONSTRAINT `asaas_clientes_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresas_construcao_usuarios` ADD CONSTRAINT `empresas_construcao_usuarios_id_empresa_construcao_fkey` FOREIGN KEY (`id_empresa_construcao`) REFERENCES `empresas_construcao`(`id_empresa_construcao`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresas_construcao_usuarios` ADD CONSTRAINT `empresas_construcao_usuarios_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `config_evolution` ADD CONSTRAINT `config_evolution_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leads` ADD CONSTRAINT `leads_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imovel_leads` ADD CONSTRAINT `imovel_leads_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id_lead`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imovel_leads` ADD CONSTRAINT `imovel_leads_id_imovel_fkey` FOREIGN KEY (`id_imovel`) REFERENCES `imoveis`(`id_imovel`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_id_lead_fkey` FOREIGN KEY (`id_lead`) REFERENCES `leads`(`id_lead`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recuperacao_senhas` ADD CONSTRAINT `recuperacao_senhas_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamentos` ADD CONSTRAINT `pagamentos_id_assinatura_fkey` FOREIGN KEY (`id_assinatura`) REFERENCES `assinaturas`(`id_assinatura`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planos_features` ADD CONSTRAINT `planos_features_id_plano_fkey` FOREIGN KEY (`id_plano`) REFERENCES `planos`(`id_plano`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planos_features` ADD CONSTRAINT `planos_features_id_feature_fkey` FOREIGN KEY (`id_feature`) REFERENCES `features`(`id_feature`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imoveis` ADD CONSTRAINT `imoveis_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imovel_ads_links` ADD CONSTRAINT `imovel_ads_links_id_imovel_fkey` FOREIGN KEY (`id_imovel`) REFERENCES `imoveis`(`id_imovel`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imovel_imagens` ADD CONSTRAINT `imovel_imagens_id_imovel_fkey` FOREIGN KEY (`id_imovel`) REFERENCES `imoveis`(`id_imovel`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imovel_unidades` ADD CONSTRAINT `imovel_unidades_id_imovel_fkey` FOREIGN KEY (`id_imovel`) REFERENCES `imoveis`(`id_imovel`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `corretores_imovel` ADD CONSTRAINT `corretores_imovel_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_keys` ADD CONSTRAINT `refresh_keys_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_id_corretor_fkey` FOREIGN KEY (`id_corretor`) REFERENCES `corretores_imovel`(`id_corretor`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_id_construtora_fkey` FOREIGN KEY (`id_construtora`) REFERENCES `empresas_construcao`(`id_empresa_construcao`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assinaturas` ADD CONSTRAINT `assinaturas_id_plano_fkey` FOREIGN KEY (`id_plano`) REFERENCES `planos`(`id_plano`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sys_modulos_features` ADD CONSTRAINT `sys_modulos_features_id_modulo_fkey` FOREIGN KEY (`id_modulo`) REFERENCES `sys_modulos`(`id_modulo`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sys_modulos_features` ADD CONSTRAINT `sys_modulos_features_id_feature_fkey` FOREIGN KEY (`id_feature`) REFERENCES `features`(`id_feature`) ON DELETE NO ACTION ON UPDATE NO ACTION;
