/**
 * Textos dos Termos de uso e da Política de privacidade.
 * Escritos a partir do que o Blue Hawk de fato coleta e mostra. Campos entre [colchetes] precisam ser
 * preenchidos por quem opera o serviço (controlador e encarregado de dados) antes da publicação.
 */
export type LegalSection = { id: string; title: string; paragraphs?: string[]; items?: string[] }
export type LegalDocument = { title: string; updatedAt: string; intro: string; sections: LegalSection[] }

const CONTROLLER = '[nome do responsável pelo Blue Hawk]'
const CONTACT = '[e-mail do encarregado de dados]'

export const TERMS: LegalDocument = {
  title: 'Termos de uso',
  updatedAt: '23 de novembro de 2026',
  intro:
    'Estes termos explicam as regras para usar o Blue Hawk: a Wiki de jogos, a estante, a Loja e o Jogue. Ao criar uma conta ou usar o site, você concorda com eles.',
  sections: [
    {
      id: 'servico',
      title: '1. O que é o Blue Hawk',
      paragraphs: [
        'O Blue Hawk é uma plataforma da comunidade de jogos de tabuleiro. Nela você consulta o catálogo de jogos (Wiki), organiza a sua coleção (estante), anuncia jogos usados (Loja) e encontra pessoas para jogar (Jogue).',
        'O Blue Hawk não vende jogos nem intermedeia pagamentos. Anúncios e partidas são combinados diretamente entre os usuários.',
      ],
    },
    {
      id: 'conta',
      title: '2. Sua conta',
      items: [
        'Você precisa informar nome, e-mail e uma senha para criar uma conta, e é responsável por manter a senha em sigilo.',
        'Use dados verdadeiros e uma conta por pessoa.',
        'Você pode pedir a exclusão da sua conta a qualquer momento, pelo contato indicado na Política de privacidade.',
      ],
    },
    {
      id: 'conteudo',
      title: '3. Conteúdo que você publica',
      paragraphs: [
        'Jogos cadastrados, fotos de capa, descrições, anúncios, mensagens para hosts e observações de partidas são publicados por você, que responde por eles.',
      ],
      items: [
        'Envie apenas fotos que você tirou ou que tem direito de usar.',
        'Jogos cadastrados por usuários passam por aprovação de um administrador antes de entrar na Wiki; o administrador pode recusar cadastros duplicados, incompletos ou impróprios.',
        'Não publique conteúdo ofensivo, discriminatório, enganoso, ilegal ou dados pessoais de outras pessoas.',
      ],
    },
    {
      id: 'loja',
      title: '4. Loja',
      items: [
        'Só jogos que estão na sua estante e aprovados na Wiki podem ser anunciados.',
        'Descreva o estado real do exemplar. O preço é definido por você.',
        'A negociação, o pagamento e a entrega são combinados entre comprador e vendedor, por conta e risco de ambos.',
      ],
    },
    {
      id: 'jogue',
      title: '5. Jogue (partidas)',
      items: [
        'Ao hospedar, você informa o jogo, a cidade, a data e o número de vagas, e decide quem entra.',
        'Ao pedir para entrar, sua mensagem e seu nome ficam visíveis para o host.',
        'Combine o endereço exato apenas com quem foi aceito. Encontros presenciais são de responsabilidade dos participantes: prefira locais seguros.',
        'Cancele com antecedência se não puder comparecer.',
      ],
    },
    {
      id: 'condutas',
      title: '6. Condutas proibidas',
      items: [
        'Usar o site para fraudes, spam ou anúncios de itens que não sejam jogos.',
        'Tentar acessar contas de outras pessoas ou burlar a segurança do sistema.',
        'Assediar, ameaçar ou expor outros usuários.',
      ],
    },
    {
      id: 'moderacao',
      title: '7. Moderação e suspensão',
      paragraphs: [
        'Podemos remover conteúdo e suspender ou encerrar contas que descumpram estes termos ou a lei, preferencialmente com aviso prévio, salvo em casos graves.',
      ],
    },
    {
      id: 'responsabilidade',
      title: '8. Limitação de responsabilidade',
      paragraphs: [
        'O Blue Hawk é oferecido como está. Não garantimos a exatidão das informações publicadas por usuários nem o resultado de negociações e encontros combinados entre eles.',
      ],
    },
    {
      id: 'mudancas',
      title: '9. Mudanças nestes termos',
      paragraphs: [
        'Podemos atualizar estes termos. Mudanças relevantes serão avisadas no site, e a data no topo indica a versão em vigor.',
      ],
    },
    {
      id: 'contato',
      title: '10. Contato e foro',
      paragraphs: [
        `Dúvidas sobre estes termos: ${CONTACT}. Responsável pelo serviço: ${CONTROLLER}.`,
        'Estes termos seguem a legislação brasileira, inclusive o Código de Defesa do Consumidor e a Lei Geral de Proteção de Dados (Lei 13.709/2018).',
      ],
    },
  ],
}

export const PRIVACY: LegalDocument = {
  title: 'Política de privacidade',
  updatedAt: '23 de novembro de 2026',
  intro:
    'Esta política explica quais dados pessoais o Blue Hawk trata, por que, com quem eles aparecem e como você exerce os seus direitos, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).',
  sections: [
    {
      id: 'controlador',
      title: '1. Quem trata os seus dados',
      paragraphs: [
        `O controlador dos dados é ${CONTROLLER}. O encarregado de dados (DPO) pode ser contatado em ${CONTACT}.`,
      ],
    },
    {
      id: 'dados',
      title: '2. Quais dados tratamos',
      items: [
        'Conta: nome, e-mail e senha (guardada apenas como hash, nunca em texto).',
        'Coleção: jogos da sua estante, jogos que você cadastrou e as fotos de capa que você enviou.',
        'Loja: seus anúncios (jogo, preço, descrição e data).',
        'Jogue: partidas que você hospeda (jogo, cidade, data e horário, observações), pedidos de entrada com a sua mensagem e as respostas do host.',
        'Curtidas: os jogos da Wiki que você curtiu.',
        'Dados técnicos: o token de acesso e a preferência de tema, guardados no armazenamento local do seu navegador.',
      ],
      paragraphs: [
        'Não pedimos CPF, endereço completo, telefone ou dados de pagamento, e não coletamos dados sensíveis.',
      ],
    },
    {
      id: 'finalidades',
      title: '3. Para que usamos e com qual base legal',
      items: [
        'Criar e manter a sua conta e oferecer as funções do site: execução de contrato (art. 7º, V).',
        'Mostrar seus anúncios na Loja e suas partidas no Jogue para outros usuários: execução de contrato, a pedido seu (art. 7º, V).',
        'Moderar cadastros de jogos e prevenir fraudes e abusos: legítimo interesse (art. 7º, IX) e segurança.',
        'Montar rankings públicos (como "Mais curtidos"), sempre de forma agregada, sem mostrar quem curtiu: legítimo interesse (art. 7º, IX).',
        'Cumprir obrigações legais e atender autoridades: obrigação legal (art. 7º, II).',
      ],
    },
    {
      id: 'visibilidade',
      title: '4. O que outras pessoas veem',
      items: [
        'Na Loja: o seu nome junto aos anúncios que você publicar.',
        'No Jogue: o seu nome e a cidade das partidas que você hospeda. O host vê o seu nome e a sua mensagem quando você pede para entrar.',
        'Seu e-mail não é exibido para outros usuários.',
        'Curtidas aparecem apenas como total por jogo.',
      ],
    },
    {
      id: 'compartilhamento',
      title: '5. Compartilhamento',
      paragraphs: [
        'Não vendemos nem alugamos dados pessoais. Podemos compartilhá-los com provedores de infraestrutura (hospedagem e banco de dados) que operam em nosso nome e seguem esta política, e com autoridades quando a lei exigir.',
        'Os provedores de hospedagem podem armazenar dados fora do Brasil; nesses casos, adotamos as garantias previstas no art. 33 da LGPD.',
      ],
    },
    {
      id: 'retencao',
      title: '6. Por quanto tempo guardamos',
      items: [
        'Enquanto a sua conta existir.',
        'Quando você pede a exclusão da conta, removemos seus dados de cadastro, estante, anúncios, curtidas, partidas e pedidos. Dados que a lei obriga a manter são guardados apenas pelo prazo exigido.',
        'Sessões expiram automaticamente; sair da conta apaga o token do seu navegador.',
      ],
    },
    {
      id: 'direitos',
      title: '7. Seus direitos (art. 18 da LGPD)',
      items: [
        'Confirmar se tratamos seus dados e acessá-los.',
        'Corrigir dados incompletos, inexatos ou desatualizados.',
        'Pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei.',
        'Pedir a portabilidade dos seus dados.',
        'Saber com quem compartilhamos seus dados.',
        'Revogar consentimentos e se opor a tratamentos baseados em legítimo interesse.',
        'Pedir a exclusão da sua conta e dos dados associados.',
      ],
      paragraphs: [
        `Para exercer qualquer direito, escreva para ${CONTACT}. Respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`,
      ],
    },
    {
      id: 'seguranca',
      title: '8. Segurança',
      paragraphs: [
        'Senhas são armazenadas com hash (BCrypt), o acesso usa tokens com validade limitada e renovação a cada uso, e cada pessoa só altera os próprios dados. Nenhum sistema é totalmente imune a falhas; em caso de incidente com risco relevante, avisaremos você e a ANPD.',
      ],
    },
    {
      id: 'armazenamento-local',
      title: '9. Cookies e armazenamento local',
      paragraphs: [
        'Não usamos cookies de publicidade nem de rastreamento. O navegador guarda apenas o necessário para o site funcionar: o token da sua sessão e a sua preferência de tema claro ou escuro.',
      ],
    },
    {
      id: 'menores',
      title: '10. Crianças e adolescentes',
      paragraphs: [
        'O Blue Hawk não é direcionado a menores de 18 anos sem a supervisão dos responsáveis. Encontros presenciais pelo Jogue devem ter acompanhamento de um adulto responsável.',
      ],
    },
    {
      id: 'atualizacoes',
      title: '11. Atualizações desta política',
      paragraphs: [
        'Podemos atualizar esta política. Mudanças relevantes serão avisadas no site, e a data no topo indica a versão em vigor.',
      ],
    },
  ],
}
